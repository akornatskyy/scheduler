package postgres

import (
	"database/sql"
	"log"

	"github.com/akornatskyy/goext/sqlx"
	"github.com/akornatskyy/scheduler/domain"
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

	selectJobs *sql.Stmt
	insertJob  *sql.Stmt
	selectJob  *sql.Stmt
	updateJob  *sql.Stmt
	deleteJob  *sql.Stmt

	selectJobStatus *sql.Stmt
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

		selectJobs: sqlx.MustPrepare(db, `
			SELECT
				id, name, state_id, schedule
			FROM job
			WHERE $1 = '' OR collection_id = $1::uuid
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
				name=$3, updated=now() at time zone 'utc', state_id = $4,
				schedule=$5, action=$6
			WHERE j.id = $1 AND j.updated = $2`),
		deleteJob: sqlx.MustPrepare(db, `
			WITH x AS (
				DELETE FROM job_status
				WHERE id = $1
			)
			DELETE FROM job WHERE id = $1`),

		selectJobStatus: sqlx.MustPrepare(db, `
			SELECT updated, running, run_count, error_count, last_run
			FROM job_status
			WHERE id = $1`),
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
					run_count=run_count+1, last_run=$3,
					error_count = error_count + CASE WHEN $5=1 /* ok */ THEN 0 ELSE 1 END
				WHERE
					id = $1
			)
			INSERT INTO job_history
			(job_id, action, started, finished, status_id, retry_count, message)
			VALUES
			($1, $2, $3, $4, $5, $6, $7)`),
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
