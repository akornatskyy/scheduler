import React from 'react';
import {Link} from 'react-router-dom';
import {Table} from 'react-bootstrap';

import {GroupByList} from '../../shared/shared';

export const VariableList = ({collections, variables}) => (
  <Table bordered striped hover>
    <thead>
      <tr>
        <th>Name</th>
        <th className="w-25">Updated</th>
      </tr>
    </thead>
    <tbody>
      <GroupByList
        groups={collections}
        items={variables}
        groupKey='collectionId'
        groupRow={(c) => (<GroupRow key={c.id} collection={c} />)}
        itemRow={(i) => (<ItemRow key={i.id} variable={i}/>)}
      />
    </tbody>
  </Table>
);

export const GroupRow = ({collection}) => (
  <tr>
    <td colSpan="2">
      <Link to={`collections/${collection.id}`}>
        {collection.name}
      </Link>
      <Link to={`jobs?collectionId=${collection.id}`}
        className="badge badge-light">
        jobs
      </Link>
    </td>
  </tr>
);

export const ItemRow = ({variable}) => (
  <tr>
    <td>
      <Link to={`variables/${variable.id}`}>{variable.name}</Link>
    </td>
    <td>
      {new Date(variable.updated).toLocaleString()}
    </td>
  </tr>
);
