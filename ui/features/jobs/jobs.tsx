import {Layout} from '$shared/components';
import {Errors, toErrorMap} from '$shared/errors';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Link, useLocation} from 'react-router';
import * as api from './jobs-api';
import {JobList} from './jobs-components';
import {Collection, Job} from './types';

export default function JobsContainer() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [errors, setErrors] = useState<Errors>();

  const location = useLocation();
  const collectionId = useMemo(
    () => new URLSearchParams(location.search).get('collectionId'),
    [location.search],
  );

  const refresh = useCallback(async () => {
    try {
      const [{items: collections}, {items: jobs}] = await Promise.all([
        api.listCollections(),
        api.listJobs(collectionId),
      ]);

      setCollections(collections);
      setJobs(jobs);
    } catch (error) {
      setErrors(toErrorMap(error));
    }
  }, [collectionId]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 10000);

    return () => clearInterval(timer);
  }, [refresh]);

  return (
    <Layout title="Jobs" errors={errors}>
      <JobList collections={collections} jobs={jobs} />
      <Link to="/jobs/add" className="btn btn-primary">
        Add
      </Link>
    </Layout>
  );
}
