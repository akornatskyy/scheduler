import React from 'react';
import {Link} from 'react-router-dom';
import {Table} from 'react-bootstrap';

import {groupBy} from '../../shared/shared';


export const VariableList = ({collections, variables}) => {
  const grouped = groupBy(variables, 'collectionId');
  const rows = [];
  collections.forEach((c) => {
    const variablesByCollection = grouped[c.id];
    if (!variablesByCollection) {
      return;
    }
    rows.push(
        <tr key={c.id}>
          <td colSpan="2">
            <Link to={`collections/${c.id}`}>{c.name}</Link>
            <Link to={`jobs?collectionId=${c.id}`}
              className="badge badge-light">
            jobs
            </Link>
          </td>
        </tr>
    );
    rows.push(variablesByCollection.map((i) => (
      <tr key={i.id}>
        <td>
          <Link to={`variables/${i.id}`}>{i.name}</Link>
        </td>
        <td>
          {new Date(i.updated).toLocaleString()}
        </td>
      </tr>
    )));
  });
  return (
    <Table bordered striped hover>
      <thead>
        <tr>
          <th>Name</th>
          <th className="w-25">Updated</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </Table>
  );
};
