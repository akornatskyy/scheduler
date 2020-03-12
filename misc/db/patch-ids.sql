BEGIN;

ALTER TABLE job_history DROP CONSTRAINT job_history_job_fk;
ALTER TABLE job_history ALTER COLUMN job_id TYPE varchar(36) USING job_id::varchar;

ALTER TABLE job_status DROP CONSTRAINT job_status_job_fk;
ALTER TABLE job_status ALTER COLUMN id TYPE varchar(36) USING id::varchar;

ALTER TABLE job ALTER COLUMN id TYPE varchar(36) USING id::varchar;

ALTER TABLE job_status ADD CONSTRAINT job_status_job_fk FOREIGN KEY (id) REFERENCES job(id);
ALTER TABLE job_history ADD CONSTRAINT job_history_job_fk FOREIGN KEY (job_id) REFERENCES job(id);

--

ALTER TABLE job DROP CONSTRAINT job_collection_fk;
ALTER TABLE job ALTER COLUMN collection_id TYPE varchar(36) USING collection_id::varchar;

ALTER TABLE collection DROP CONSTRAINT collection_pkey;
ALTER TABLE collection ALTER COLUMN id TYPE varchar(36) USING id::varchar;
ALTER TABLE collection ADD CONSTRAINT collection_pkey PRIMARY KEY (id);


ALTER TABLE job ADD CONSTRAINT job_collection_fk FOREIGN KEY (collection_id) REFERENCES collection(id);

ALTER TABLE job_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE job_history ALTER COLUMN id TYPE varchar(36) USING id::varchar;
DROP SEQUENCE job_history_seq;


DROP TRIGGER collection_notify ON collection;
DROP TRIGGER job_notify ON job;

DROP FUNCTION table_update_notify();

CREATE OR REPLACE FUNCTION table_update_notify()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
  DECLARE
    id varchar;
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
  $function$
;

CREATE TRIGGER collection_notify AFTER UPDATE ON
collection FOR EACH ROW EXECUTE FUNCTION table_update_notify();
CREATE TRIGGER job_notify AFTER INSERT OR UPDATE OR DELETE ON
job FOR EACH ROW EXECUTE FUNCTION table_update_notify();

COMMIT;