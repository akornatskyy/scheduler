// Package postgres provides PostgreSQL implementation of the domain repository.
package postgres

import (
	"database/sql"
	"log"

	"github.com/akornatskyy/goext/sqlx"
	"github.com/akornatskyy/scheduler/internal/domain"
	"github.com/lib/pq"
)

const (
	errDuplicateKey = "23505"
	errForeignKey   = "23503"
)

type sqlRepository struct {
	db *sql.DB

	selectCollections *sql.Stmt
	insertCollection  *sql.Stmt
	selectCollection  *sql.Stmt
	updateCollection  *sql.Stmt
	deleteCollection  *sql.Stmt

	selectVariables          *sql.Stmt
	selectVariablesNameValue *sql.Stmt
	insertVariable           *sql.Stmt
	selectVariable           *sql.Stmt
	updateVariable           *sql.Stmt
	deleteVariable           *sql.Stmt

	selectJobs         *sql.Stmt
	insertJob          *sql.Stmt
	selectJob          *sql.Stmt
	updateJob          *sql.Stmt
	deleteJob          *sql.Stmt
	selectLeftOverJobs *sql.Stmt

	selectJobStatus *sql.Stmt
	resetJobStatus  *sql.Stmt
	updateJobStatus *sql.Stmt

	selectJobHistory *sql.Stmt
	insertJobHistory *sql.Stmt
	deleteJobHistory *sql.Stmt
}

// NewRepository returns postgres implementation of domain.Repository
func NewRepository(dsn string) domain.Repository {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("ERR: %s", err)
	}

	if err = migrate(db); err != nil {
		log.Fatalf("ERR: failed to apply migrations: %s", err)
	}

	return &sqlRepository{
		db: db,

		selectCollections: sqlx.MustPrepare(db, `
			SELECT id, name, state_id
			FROM collection
			ORDER BY name`),
		insertCollection: sqlx.MustPrepare(db, `
			INSERT INTO collection (id, name, state_id)
			VALUES ($1, $2, $3)`),
		selectCollection: sqlx.MustPrepare(db, `
			SELECT id, name, updated, state_id
			FROM collection
			WHERE id = $1`),
		updateCollection: sqlx.MustPrepare(db, `
			UPDATE collection
			SET name=$3, updated=now() at time zone 'utc', state_id = $4
			WHERE id=$1 AND updated=$2`),
		deleteCollection: sqlx.MustPrepare(db, `
			DELETE FROM collection WHERE id = $1`),

		selectVariables: sqlx.MustPrepare(db, `
			SELECT
				id, name, collection_id, updated
			FROM variable
			WHERE $1 = '' OR collection_id = $1
			ORDER BY collection_id, name`),
		selectVariablesNameValue: sqlx.MustPrepare(db, `
			SELECT
				name, value
			FROM variable
			WHERE collection_id = $1`),
		insertVariable: sqlx.MustPrepare(db, `
			INSERT INTO variable (id, name, collection_id, value)
			VALUES ($1, $2, $3, $4)`),
		selectVariable: sqlx.MustPrepare(db, `
			SELECT id, name, updated, collection_id, value
			FROM variable
			WHERE id = $1`),
		updateVariable: sqlx.MustPrepare(db, `
			UPDATE variable
			SET
				name=$3, updated=now() at time zone 'utc',
				collection_id=$4, value=$5
			WHERE id = $1 AND updated = $2`),
		deleteVariable: sqlx.MustPrepare(db, `
			DELETE FROM variable WHERE id = $1`),

		selectJobs: sqlx.MustPrepare(db, `
			SELECT
				j.id, collection_id, name, state_id, schedule,
				CASE WHEN 'status' = ANY($2) THEN (
					SELECT
						CASE WHEN js.running THEN 2
						ELSE COALESCE((
							SELECT
								CASE jh.status_id
									WHEN 1 THEN 3 -- passing
									ELSE 4 -- failing
								END
							FROM job_history jh
							WHERE jh.job_id = j.id
								AND started > (now() at time zone 'utc' - '1d'::interval)
							ORDER BY jh.finished DESC
							LIMIT 1
						), 1) -- ready
						END AS status
					FROM job_status js
					WHERE js.id = j.id
				)
				END AS status,
				CASE WHEN 'errorRate' = ANY($2) THEN (
					SELECT
						count(CASE WHEN status_id = 2 THEN true END)::float
							/ CASE WHEN count(*) = 0 THEN 1 ELSE count(*) END
					FROM job_history jh
					WHERE jh.job_id = j.id
						AND started > (now() at time zone 'utc' - '1d'::interval)
				)
				END AS error_rate
			FROM job j
			WHERE $1 = '' OR collection_id = $1
			ORDER BY name`),
		insertJob: sqlx.MustPrepare(db, `
			WITH x AS (
				INSERT INTO job_status (id)
				VALUES ($1)
			)
			INSERT INTO job (id, name, collection_id, state_id, schedule, action)
			VALUES ($1, $2, $3, $4, $5, $6)`),
		selectJob: sqlx.MustPrepare(db, `
			SELECT id, name, updated, collection_id, state_id, schedule, action
			FROM job
			WHERE id = $1`),
		updateJob: sqlx.MustPrepare(db, `
			UPDATE job j
			SET
				name=$3, updated=now() at time zone 'utc', collection_id=$4,
				state_id=$5, schedule=$6, action=$7
			WHERE j.id = $1 AND j.updated = $2`),
		deleteJob: sqlx.MustPrepare(db, `
			WITH x AS (
				DELETE FROM job_status
				WHERE id = $1
			)
			DELETE FROM job WHERE id = $1`),
		selectLeftOverJobs: sqlx.MustPrepare(db, `
			SELECT
				j.id
			FROM job j
			INNER JOIN job_status js ON j.id = js.id
			WHERE
				js.running
				AND age(now() at time zone 'utc', js.updated) >
								(j.action->'retryPolicy'->>'deadline')::interval`),

		selectJobStatus: sqlx.MustPrepare(db, `
			SELECT updated, running, run_count, error_count, last_run
			FROM job_status
			WHERE id = $1`),
		resetJobStatus: sqlx.MustPrepare(db, `
			WITH x AS (
				SELECT
					js.id,
					action->>'type' as "action",
					js.updated started,
					now() at time zone 'utc' finished
				FROM job_status js
				INNER JOIN job j ON js.id = j.id
				WHERE
					j.id = $1 AND running
				FOR UPDATE
			), u AS (
				UPDATE job_status js
				SET
					updated=x.finished,
					running=false,
					run_count=run_count+1,
					error_count=error_count+1
				FROM x
				WHERE
					js.id = x.id AND running
			)
			INSERT INTO job_history
			(id, job_id, action, started, finished, status_id, retry_count, message)
			SELECT
				$2, id, action, started, x.finished, 2 /* failed  */, 0, 'status reset'
			FROM x`),
		updateJobStatus: sqlx.MustPrepare(db, `
			UPDATE job_status
			SET updated=now() at time zone 'utc', running=true
			WHERE id = $1 AND (
				running = false OR
				age(now() at time zone 'utc', updated) > $2
			)`),

		selectJobHistory: sqlx.MustPrepare(db, `
			SELECT action, started, finished, status_id, retry_count, message
			FROM job_history j
			WHERE job_id = $1
			ORDER BY started DESC
			LIMIT 100`),
		insertJobHistory: sqlx.MustPrepare(db, `
			WITH x AS (
				UPDATE job_status
				SET
					updated=now() at time zone 'utc', running=false,
					run_count=run_count+1, last_run=$4,
					error_count = error_count + CASE WHEN $6=1 /* ok */ THEN 0 ELSE 1 END
				WHERE
					id = $2
			)
			INSERT INTO job_history
			(id, job_id, action, started, finished, status_id, retry_count, message)
			VALUES
			($1, $2, $3, $4, $5, $6, $7, $8)`),
		deleteJobHistory: sqlx.MustPrepare(db, `
			DELETE FROM job_history WHERE job_id = $1 AND started < $2`),
	}
}

func (r *sqlRepository) Ping() error {
	return r.db.Ping()
}

func (r *sqlRepository) Close() error {
	return r.db.Close()
}

func checkExec(res sql.Result, err error) error {
	if err != nil {
		if err, ok := err.(*pq.Error); ok {
			switch err.Code {
			case errDuplicateKey:
				return domain.ErrConflict
			case errForeignKey:
				return domain.ErrConflict
			}
		}
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n != 1 {
		return domain.ErrNotFound
	}
	return nil
}
