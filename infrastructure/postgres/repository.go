package postgres

import (
	"database/sql"
	"log"

	"github.com/akornatskyy/scheduler/domain"
	"github.com/akornatskyy/scheduler/shared/sqlx"
	_ "github.com/lib/pq"
)

type sqlRepository struct {
	db *sql.DB

	selectCollections *sql.Stmt
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
	}
}

func (r *sqlRepository) Ping() error {
	return r.db.Ping()
}

func (r *sqlRepository) Close() error {
	return r.db.Close()
}
