import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Layout} from '$shared/components';
import {Errors} from '$shared/types';
import * as api from './history-api';
import {JobHistoryList} from './history-components';
import {Job, JobHistory, JobStatus} from './types';

const INITIAL: JobStatus = {
  runCount: 0,
  errorCount: 0,
};

export default function JobHistoryContainer() {
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();
  if (!id) return null;
  const [job, setJob] = useState<Job>({name: ''});
  const [status, setStatus] = useState<JobStatus>(INITIAL);
  const [items, setItems] = useState<JobHistory[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    api
      .retrieveJob(id)
      .then((job) => setJob(job))
      .catch((errors) => setErrors(errors));

    api
      .retrieveJobStatus(id)
      .then((status) => setStatus(status))
      .catch((errors) => setErrors(errors));

    api
      .listJobHistory(id)
      .then(({items}) => setItems(items.slice(0, 7)))
      .catch((errors) => setErrors(errors));
  }, [id]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const handleRun = useCallback(() => {
    const {etag} = status;
    api
      .patchJobStatus(id, {running: true, etag})
      .then(() =>
        api
          .retrieveJobStatus(id)
          .then((status) => setStatus(status))
          .catch((errors) => setErrors(errors)),
      )
      .catch((errors) => setErrors(errors));
  }, [id, status]);

  const handleDelete = useCallback(() => {
    const {etag} = status;
    api
      .deleteJobHistory(id, etag)
      .then(() => navigate(-1))
      .catch((errors) => setErrors(errors));
  }, [id, status, navigate]);

  return (
    <Layout title={`Job History ${job.name}`} errors={errors}>
      <JobHistoryList
        status={status}
        items={items}
        onBack={handleBack}
        onRun={handleRun}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
