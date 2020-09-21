import React from 'react';
import {Link} from 'react-router-dom';
import {Table} from 'react-bootstrap';

export const CollectionList = ({items}) => (
  <Table bordered striped hover>
    <thead>
      <tr>
        <th>Name</th>
        <th className="w-25">State</th>
      </tr>
    </thead>
    <tbody>
      {items.map((i) => (
        <tr key={i.id}>
          <td>
            <Link to={`collections/${i.id}`}>{i.name}</Link>
            <Link to={`variables?collectionId=${i.id}`}
              className="badge badge-light mx-1">
              variables
            </Link>
            <Link to={`jobs?collectionId=${i.id}`}
              className="badge badge-light">
              jobs
            </Link>
          </td>
          <td>{i.state}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);
