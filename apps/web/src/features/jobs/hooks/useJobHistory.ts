import {Errors, toErrorMap} from '$shared/errors';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import * as api from '../api';
import {JobDefinition, JobHistory, JobStatus} from '../types';

const INITIAL: JobStatus = {
  runCount: 0,
  errorCount: 0,
};

export function useJobHistory(id: string) {
  const navigate = useNavigate();
  const etagRef = useRef<string>(undefined);
  const [job, setJob] = useState<Pick<JobDefinition, 'name'>>({name: ''});
  const [status, setStatus] = useState<JobStatus>(INITIAL);
  const [items, setItems] = useState<JobHistory[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    (async () => {
      try {
        const [[job], [status, etag], {items}] = await Promise.all([
          api.getJob(id),
          api.getJobStatus(id),
          api.listJobHistory(id),
        ]);
        setJob(job);
        setStatus(status);
        etagRef.current = etag;
        setItems(items.slice(0, 7));
      } catch (error) {
        setErrors(toErrorMap(error));
      }
    })();
  }, [id]);

  const back = useCallback(() => navigate(`/jobs/${id}`), [id, navigate]);

  const run = useCallback(async () => {
    try {
      await api.updateJobStatus(id, {running: true}, etagRef.current);

      const [updatedStatus, etag] = await api.getJobStatus(id);
      setStatus(updatedStatus);
      etagRef.current = etag;
    } catch (error) {
      setErrors(toErrorMap(error));
    }
  }, [id]);

  const remove = useCallback(async () => {
    try {
      await api.deleteJobHistory(id, etagRef.current);
      navigate(`/jobs/${id}`);
    } catch (error) {
      setErrors(toErrorMap(error));
    }
  }, [id, navigate]);

  return {job, status, items, errors, back, run, remove};
}
