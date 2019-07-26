package postgres

import (
	"database/sql"
	"log"

	"github.com/akornatskyy/scheduler/domain"
	"github.com/akornatskyy/scheduler/shared/sqlx"
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
