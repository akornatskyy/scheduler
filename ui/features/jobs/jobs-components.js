import React from 'react';
import {Link} from 'react-router-dom';
import {Table} from 'react-bootstrap';

import {GroupByList} from '../../shared/components';

export const JobList = ({jobs, collections}) => (
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
        groupKey='collectionId'
        groupRow={(c) => (<GroupRow key={c.id} collection={c} />)}
        itemRow={(i) => (<ItemRow key={i.id} job={i} />)}
      />
    </tbody>
  </Table>
);

export const GroupRow = ({collection}) => (
  <tr title={collection.state}>
    <td colSpan="3">
      <Link to={`/collections/${collection.id}`}
        className={collection.state === 'disabled' ? 'text-muted' : ''}>
        {collection.name}
      </Link>
      <Link to={`variables?collectionId=${collection.id}`}
        className="badge badge-light mx-1">
        variables
      </Link>
    </td>
  </tr>
);

export const ItemRow = ({job}) => (
  <tr>
    <td>
      <Link to={`jobs/${job.id}`}
        className={job.state === 'disabled' ? 'text-muted' : ''}>
        {job.name}
      </Link>
    </td>
    <td className={job.state === 'disabled' ? 'text-muted' : ''}
      title={job.state}>
      {job.schedule}
    </td>
    <td>
      <JobStatus job={job} />
    </td>
  </tr>
);

export const JobStatus = ({job}) => {
  let style = 'secondary';
  let text = job.status;
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
    style = 'secondary font-weight-normal';
  }
  return (
    <span className={`badge badge-${style}`}>{text}</span>
  );
};
