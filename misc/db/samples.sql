INSERT INTO collection (id,"name",updated,state_id) VALUES 
('65ada2f9-be3d-4960-a7f4-ea47fe3323b9','My App #1','2019-08-29 13:29:36.976',1),
('7d76cb30-f581-49ca-a718-d353a1d129a8','My Other App','2019-08-29 13:29:44.200',2);

INSERT INTO job (id,"name",updated,collection_id,state_id,schedule,"action") VALUES 
('7ce1f17e-48b1-4e73-be22-771fa764993a','My Task #1','2019-08-29 13:30:30.342','65ada2f9-be3d-4960-a7f4-ea47fe3323b9',2,'@every 15s','{"type":"HTTP","request":{"method":"GET","uri":"http://localhost:8080/test","headers":[{"name":"X-Requested-With","value":"XMLHttpRequest"}]},"retryPolicy":{"retryCount":3,"retryInterval":"10s","deadline":"1m0s"}}'),
('94946f60-711f-4044-b08e-ccd9ba998f88','My Task #2','2019-08-29 13:31:37.493','7d76cb30-f581-49ca-a718-d353a1d129a8',1,'@every 1m','{"type":"HTTP","request":{"method":"POST","uri":"http://localhost:8000/test","headers":[{"name":"X-Requested-With","value":"XMLHttpRequest"},{"name":"Content-Type","value":"application/json"}],"body":"{}"},"retryPolicy":{"retryCount":3,"retryInterval":"10s","deadline":"1m0s"}}');

INSERT INTO job_status (id,updated,running,run_count,error_count,last_run) VALUES 
('7ce1f17e-48b1-4e73-be22-771fa764993a','2019-08-29 13:30:30.342',false,4,2,'2019-09-18 09:26:13.000'),
('94946f60-711f-4044-b08e-ccd9ba998f88','2019-08-29 13:31:37.493',false,0,0,NULL);

INSERT INTO job_history (job_id,"action",started,finished,status_id,retry_count,message) VALUES 
('7ce1f17e-48b1-4e73-be22-771fa764993a','HTTP','2019-09-18 06:24:43.000','2019-09-18 06:25:23.000',2,3,'404 Not Found'),
('7ce1f17e-48b1-4e73-be22-771fa764993a','HTTP','2019-09-18 06:25:41.000','2019-09-18 06:25:41.000',1,0,NULL),
('7ce1f17e-48b1-4e73-be22-771fa764993a','HTTP','2019-09-18 06:25:56.000','2019-09-18 06:25:56.000',1,0,NULL),
('7ce1f17e-48b1-4e73-be22-771fa764993a','HTTP','2019-09-18 06:26:13.000','2019-09-18 06:27:02.000',2,3,'Get http://localhost2:8080/: dial tcp: lookup localhost2: no such host');
