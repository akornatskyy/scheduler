import {GroupByList} from '$shared/components';
import {Table} from 'react-bootstrap';
import {Link} from 'react-router';
import {Collection, Job} from '../types';

type JobListProps = {
  jobs: Job[];
  collections: Collection[];
};

export const JobTable = ({jobs, collections}: JobListProps) => (
  <Table bordered striped hover>
    <thead>
      <tr>
        <th>Name</th>
        <th className="w-25">Schedule</th>
        <th className="w-25">Status</th>
      </tr>
    </thead>
    <tbody>
      <GroupByList
        groups={collections}
        items={jobs}
        groupKey="collectionId"
        groupRow={(c) => <GroupRow key={c.id} collection={c} />}
        itemRow={(i) => <ItemRow key={i.id} job={i} />}
      />
    </tbody>
  </Table>
);

type GroupRowProps = {
  collection: Collection;
};

export const GroupRow = ({collection}: GroupRowProps) => (
  <tr title={collection.state}>
    <td colSpan={3}>
      <Link
        to={`/collections/${collection.id}`}
        className={collection.state === 'disabled' ? 'text-muted' : ''}
      >
        {collection.name}
      </Link>
      <Link to={`/variables?collectionId=${collection.id}`}>
        <span className="badge bg-light mx-1">variables</span>
      </Link>
    </td>
  </tr>
);

type ItemRowProps = {
  job: Job;
};

export const ItemRow = ({job}: ItemRowProps) => (
  <tr>
    <td>
      <Link
        to={`/jobs/${job.id}`}
        className={job.state === 'disabled' ? 'text-muted' : ''}
      >
        {job.name}
      </Link>
    </td>
    <td
      className={job.state === 'disabled' ? 'text-muted' : ''}
      title={job.state}
    >
      {job.schedule}
    </td>
    <td>
      <JobStatus job={job} />
    </td>
  </tr>
);

type JobStatusProps = {
  job: Job;
};

export const JobStatus = ({job}: JobStatusProps) => {
  let style = 'secondary';
  let text: string = job.status;
  switch (job.status) {
    case 'ready':
      style = 'warning';
      break;
    case 'passing':
      style = 'success';
      text = `${Math.round((1 - (job.errorRate || 0)) * 100)}% ${text}`;
      break;
    case 'failing':
      style = 'danger';
      text = `${Math.round((job.errorRate || 0) * 100)}% ${text}`;
      break;
    case 'running':
      style = 'info';
      break;
  }

  if (job.state === 'disabled') {
    style = 'secondary fw-normal';
  }

  return <span className={`badge bg-${style}`}>{text}</span>;
};
