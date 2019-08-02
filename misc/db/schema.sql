DROP SCHEMA public CASCADE;

CREATE SCHEMA public AUTHORIZATION postgres;

CREATE TABLE collection_state (
  id INT NOT NULL,
  name VARCHAR(20) NOT NULL,

  PRIMARY KEY (id)
);

INSERT INTO collection_state VALUES
(1, 'enabled'),
(2, 'disabled');

CREATE TABLE collection (
  id UUID NOT NULL,
  name VARCHAR(64) NOT NULL UNIQUE,
  updated TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
  state_id INT NOT NULL DEFAULT 1,

  PRIMARY KEY (id),
  CONSTRAINT collection_collection_state_fk FOREIGN KEY (state_id) REFERENCES collection_state(id)
);

CREATE TABLE job_state (
  id INT NOT NULL,
  name VARCHAR(20) NOT NULL,

  PRIMARY KEY (id)
);

INSERT INTO job_state VALUES
(1, 'enabled'),
(2, 'disabled');

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
  CONSTRAINT job_collection_fk FOREIGN KEY (collection_id) REFERENCES collection(id),
  CONSTRAINT job_job_state_fk FOREIGN KEY (state_id) REFERENCES job_state(id)
);

CREATE TABLE job_status (
  id UUID NOT NULL,
  updated TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
  running BOOL NOT NULL DEFAULT FALSE,
  run_count INT NOT NULL DEFAULT 0,
  error_count INT NOT NULL DEFAULT 0,
  last_run TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT job_status_job_fk FOREIGN KEY (id) REFERENCES job(id)
);

CREATE TABLE job_history_status (
  id INT NOT NULL,
  name VARCHAR(20) NOT NULL,

  PRIMARY KEY (id)
);

INSERT INTO job_history_status VALUES
(1, 'completed'),
(2, 'failed');

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
  CONSTRAINT job_history_job_fk FOREIGN KEY (job_id) REFERENCES job(id),
  CONSTRAINT job_history_status_fk FOREIGN KEY (status_id) REFERENCES job_history_status(id)
);
