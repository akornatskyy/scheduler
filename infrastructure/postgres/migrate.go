package postgres

import (
	"database/sql"
	"fmt"
)

func migrate(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS migration (
			id INT NOT NULL,
			created TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
		);
	`)
	if err != nil {
		return err
	}

	tx, err := db.Begin()
	var s int
	err = db.QueryRow("SELECT COALESCE(MAX(id), 0) FROM migration").Scan(&s)
	if err != nil {
		return err
	}
	for i := s; i < len(migrations); i++ {
		_, err := tx.Exec(migrations[i])
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("migration %d: %v", i, err)
		}
		_, err = tx.Exec("INSERT INTO migration (id) VALUES ($1)", i+1)
		if err != nil {
			tx.Rollback()
			return err
		}
	}
	tx.Commit()

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
		id UUID NOT NULL,
		name VARCHAR(64) NOT NULL UNIQUE,
		updated TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
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
		id UUID NOT NULL,
		name VARCHAR(64) NOT NULL,
		updated TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
		collection_id UUID NOT NULL,
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
		id UUID NOT NULL,
		updated TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
		running BOOL NOT NULL DEFAULT FALSE,
		run_count INT NOT NULL DEFAULT 0,
		error_count INT NOT NULL DEFAULT 0,
		last_run TIMESTAMP,

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
	CREATE SEQUENCE job_history_seq;

	CREATE TABLE job_history (
		id INT NOT NULL DEFAULT nextval('job_history_seq'),
		job_id UUID NOT NULL,
		action VARCHAR(64) NOT NULL,
		started TIMESTAMP NOT NULL,
		finished TIMESTAMP NOT NULL,
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
		id UUID;
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
}
