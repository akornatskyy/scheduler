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
