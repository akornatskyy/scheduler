import {Layout} from '$shared/components';
import {Errors, toErrorMap} from '$shared/errors';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import * as api from '../api';
import {JobHistoryTable} from '../components/JobHistoryTable';
import {JobDefinition, JobHistory, JobStatus} from '../types';

const INITIAL: JobStatus = {
  runCount: 0,
  errorCount: 0,
};

export function JobHistoryPage() {
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();
  if (!id) return null;
  const [job, setJob] = useState<Pick<JobDefinition, 'name'>>({name: ''});
  const [status, setStatus] = useState<JobStatus>(INITIAL);
  const [items, setItems] = useState<JobHistory[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    (async () => {
      try {
        const [job, status, {items}] = await Promise.all([
          api.retrieveJob(id),
          api.retrieveJobStatus(id),
          api.listJobHistory(id),
        ]);
        setJob(job);
        setStatus(status);
        setItems(items.slice(0, 7));
      } catch (error) {
        setErrors(toErrorMap(error));
      }
    })();
  }, [id]);

  const handleBack = useCallback(() => navigate(`/jobs/${id}`), [id, navigate]);

  const handleRun = useCallback(async () => {
    try {
      await api.patchJobStatus(id, {running: true, etag: status.etag});

      const updatedStatus = await api.retrieveJobStatus(id);
      setStatus(updatedStatus);
    } catch (error) {
      setErrors(toErrorMap(error));
    }
  }, [id, status.etag]);

  const handleDelete = useCallback(async () => {
    try {
      await api.deleteJobHistory(id, status.etag);
      navigate(`/jobs/${id}`);
    } catch (error) {
      setErrors(toErrorMap(error));
    }
  }, [id, status.etag, navigate]);

  return (
    <Layout title={`Job History ${job.name}`} errors={errors}>
      <JobHistoryTable
        status={status}
        items={items}
        onBack={handleBack}
        onRun={handleRun}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
