INSERT INTO collection (id,"name",updated,state_id) VALUES 
('xebs7HqKQpU','My App #1','2020-03-29 13:29:36.976',1),
('kUgrsOoGDuY','My Other App','2020-03-29 13:29:44.200',2);

INSERT INTO job (id,"name",updated,collection_id,state_id,schedule,"action") VALUES 
('1hZsD7XGqPE','My Task #1','2020-04-10 11:35:30.342','xebs7HqKQpU',2,'@every 15s','{"type":"HTTP","request":{"method":"GET","uri":"http://{{.Host}}","headers":[{"name":"X-Requested-With","value":"XMLHttpRequest"},{"name": "Authorization", "value": "Bearer: {{.Token}}"}]},"retryPolicy":{"retryCount":3,"retryInterval":"10s","deadline":"1m0s"}}'),
('cBFGwbpvWkQ','My Task #2','2020-03-29 13:31:37.493','kUgrsOoGDuY',1,'@every 1m','{"type":"HTTP","request":{"method":"POST","uri":"http://localhost:8000/test","headers":[{"name":"X-Requested-With","value":"XMLHttpRequest"},{"name":"Content-Type","value":"application/json"}],"body":"{}"},"retryPolicy":{"retryCount":3,"retryInterval":"10s","deadline":"1m0s"}}');

INSERT INTO job_status (id,updated,running,run_count,error_count,last_run) VALUES 
('1hZsD7XGqPE','2020-03-29 13:30:30.342',false,4,2,'2020-04-01 09:26:13.000'),
('cBFGwbpvWkQ','2020-03-29 13:31:37.493',false,0,0,NULL);

INSERT INTO job_history (id, job_id,"action",started,finished,status_id,retry_count,message) VALUES 
('7LFKl36KpvE', '1hZsD7XGqPE','HTTP','2020-04-01 06:24:43.000','2020-04-01 06:25:23.000',2,3,'404 Not Found'),
('mFtYG5ZkM08', '1hZsD7XGqPE','HTTP','2020-04-01 06:25:41.000','2020-04-01 06:25:41.000',1,0,NULL),
('tKUYfJldG3M', '1hZsD7XGqPE','HTTP','2020-04-01 06:25:56.000','2020-04-01 06:25:56.000',1,0,NULL),
('x3NvtXaBYvE', '1hZsD7XGqPE','HTTP','2020-04-01 06:26:13.000','2020-04-01 06:27:02.000',2,3,'Get http://localhost2:8080/: dial tcp: lookup localhost2: no such host');

INSERT INTO variable (id, collection_id, "name", updated, value) VALUES
('xphekQqIUM8', 'xebs7HqKQpU', 'Host', '2020-04-10 11:26:53.000', 'localhost:8081'),
('v5k0ZORBdDk', 'xebs7HqKQpU', 'Token', '2020-04-10 11:29:29.000', 'eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.bQTnz6AuMJvmXXQsVPrxeQNvzDkimo7VNXxHeSBfClLufmCVZRUuyTwJF311JHuh');
