package postgres

import (
	"database/sql"
	"fmt"
)

func migrate(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS migration (
			id INT NOT NULL,
			created TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
		);
	`)
	if err != nil {
		return err
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	var s int
	err = db.QueryRow("SELECT COALESCE(MAX(id), 0) FROM migration").Scan(&s)
	if err != nil {
		return err
	}
	for i := s; i < len(migrations); i++ {
		_, err := tx.Exec(migrations[i])
		if err != nil {
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return fmt.Errorf("migration %d: %v (rollback failed: %v)", i, err, rollbackErr)
			}
			return fmt.Errorf("migration %d: %v", i, err)
		}
		_, err = tx.Exec("INSERT INTO migration (id) VALUES ($1)", i+1)
		if err != nil {
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				return fmt.Errorf("failed to insert migration record (rollback failed: %v)", rollbackErr)
			}
			return err
		}
	}
	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

var migrations = []string{
	`
	CREATE TABLE collection_state (
		id INT NOT NULL,
		name VARCHAR(20) NOT NULL,

		PRIMARY KEY (id)
	);

	INSERT INTO collection_state VALUES
	(1, 'enabled'),
	(2, 'disabled')`,
	`
	CREATE TABLE collection (
		id VARCHAR(36) NOT NULL,
		name VARCHAR(64) NOT NULL UNIQUE,
		updated TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
		state_id INT NOT NULL DEFAULT 1,

		PRIMARY KEY (id),
		CONSTRAINT collection_collection_state_fk FOREIGN KEY (state_id)
			REFERENCES collection_state(id)
	)`,
	`
	CREATE TABLE job_state (
		id INT NOT NULL,
		name VARCHAR(20) NOT NULL,

		PRIMARY KEY (id)
	);

	INSERT INTO job_state VALUES
	(1, 'enabled'),
	(2, 'disabled')`,
	`
	CREATE TABLE job (
		id VARCHAR(36) NOT NULL,
		name VARCHAR(64) NOT NULL,
		updated TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
		collection_id VARCHAR(36) NOT NULL,
		state_id INT NOT NULL,
		schedule VARCHAR(64) NOT NULL,
		action JSON NOT NULL,

		PRIMARY KEY (id),
		UNIQUE (name, collection_id),
		CONSTRAINT job_collection_fk FOREIGN KEY (collection_id)
			REFERENCES collection(id),
		CONSTRAINT job_job_state_fk FOREIGN KEY (state_id)
			REFERENCES job_state(id)
	)`,
	`
	CREATE TABLE job_status (
		id VARCHAR(36) NOT NULL,
		updated TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
		running BOOL NOT NULL DEFAULT FALSE,
		run_count INT NOT NULL DEFAULT 0,
		error_count INT NOT NULL DEFAULT 0,
		last_run TIMESTAMPTZ,

		PRIMARY KEY (id),
		CONSTRAINT job_status_job_fk FOREIGN KEY (id) REFERENCES job(id)
	)`,
	`
	CREATE TABLE job_history_status (
		id INT NOT NULL,
		name VARCHAR(20) NOT NULL,

		PRIMARY KEY (id)
	);

	INSERT INTO job_history_status VALUES
	(1, 'completed'),
	(2, 'failed')`,
	`
	CREATE TABLE job_history (
		id VARCHAR(36) NOT NULL,
		job_id VARCHAR(36) NOT NULL,
		action VARCHAR(64) NOT NULL,
		started TIMESTAMPTZ NOT NULL,
		finished TIMESTAMPTZ NOT NULL,
		status_id INT NOT NULL,
		retry_count INT NOT NULL,
		message VARCHAR(1024),

		PRIMARY KEY (id),
		CONSTRAINT job_history_job_fk FOREIGN KEY (job_id)
			REFERENCES job(id),
		CONSTRAINT job_history_status_fk FOREIGN KEY (status_id)
			REFERENCES job_history_status(id)
	)`,
	`
	CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
	DECLARE
		id VARCHAR;
	BEGIN
		IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
			id = NEW.id;
		ELSE
			id = OLD.id;
		END IF;
		PERFORM pg_notify(
			'table_update', TG_OP || ' ' || TG_TABLE_NAME || ' ' || id);
		RETURN NEW;
	END;
	$$ LANGUAGE plpgsql`,
	`
	CREATE TRIGGER collection_notify AFTER UPDATE ON collection
	FOR EACH ROW EXECUTE PROCEDURE table_update_notify()`,
	`
	CREATE TRIGGER job_notify AFTER INSERT OR UPDATE OR DELETE ON job
	FOR EACH ROW EXECUTE PROCEDURE table_update_notify()
	`,
	`
	CREATE TABLE variable (
		id VARCHAR(36) NOT NULL,
		collection_id VARCHAR(36) NOT NULL,
		name VARCHAR(64) NOT NULL,
		updated TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
		value VARCHAR(1024) NOT NULL,

		PRIMARY KEY (id),
		UNIQUE (name, collection_id),
		CONSTRAINT variable_collection_fk FOREIGN KEY (collection_id)
			REFERENCES collection(id)
	)`,
}
