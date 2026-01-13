import {JobTable, useJobs} from '$features/jobs';
import {Layout} from '$shared/components';
import {useMemo} from 'react';
import {Link, useLocation} from 'react-router';

export function JobsPage() {
  const location = useLocation();
  const collectionId = useMemo(
    () => new URLSearchParams(location.search).get('collectionId'),
    [location.search],
  );

  const {collections, jobs, errors} = useJobs(collectionId);

  return (
    <Layout title="Jobs" errors={errors}>
      <JobTable collections={collections} jobs={jobs} />
      <Link to="/jobs/add" className="btn btn-primary">
        Add
      </Link>
    </Layout>
  );
}
