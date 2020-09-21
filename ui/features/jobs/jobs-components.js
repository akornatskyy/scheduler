import React from 'react';
import {Link} from 'react-router-dom';
import {Table} from 'react-bootstrap';

import {groupBy} from '../../shared/shared';

export const JobList = ({jobs, collections}) => {
  const grouped = groupBy(jobs, 'collectionId');
  const rows = [];
  collections.forEach((c) => {
    const jobsByCollection = grouped[c.id];
    if (!jobsByCollection) {
      return;
    }
    rows.push(
        <tr key={c.id} title={c.state}>
          <td colSpan="3">
            <Link to={`/collections/${c.id}`}
              className={c.state === 'disabled' ? 'text-muted' : ''}>
              {c.name}
            </Link>
            <Link to={`variables?collectionId=${c.id}`}
              className="badge badge-light mx-1">
            variables
            </Link>
          </td>
        </tr>
    );
    rows.push(jobsByCollection.map((job) => (
      <tr key={job.id}>
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
    )));
  });
  return (
    <Table bordered striped hover>
      <thead>
        <tr>
          <th>Name</th>
          <th className="w-25">Schedule</th>
          <th className="w-25">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </Table>
  );
};

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
