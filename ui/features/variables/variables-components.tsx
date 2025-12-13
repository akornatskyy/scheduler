import React from 'react';
import {Table} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {GroupByList} from '../../shared/components';
import {Collection, Variable} from './types';

type VariableListProps = {
  collections: Collection[];
  variables: Variable[];
};

export const VariableList = ({
  collections,
  variables,
}: VariableListProps): React.ReactElement => (
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
        groupKey="collectionId"
        groupRow={(c) => <GroupRow key={c.id} collection={c} />}
        itemRow={(i) => <ItemRow key={i.id} variable={i} />}
      />
    </tbody>
  </Table>
);

type GroupRowProps = {
  collection: Collection;
};

export const GroupRow = ({collection}: GroupRowProps): React.ReactElement => (
  <tr>
    <td colSpan={2}>
      <Link to={`/collections/${collection.id}`}>{collection.name}</Link>
      <Link to={`/jobs?collectionId=${collection.id}`}>
        <span className="badge bg-light">jobs</span>
      </Link>
    </td>
  </tr>
);

type ItemRowProps = {
  variable: Variable;
};

export const ItemRow = ({variable}: ItemRowProps): React.ReactElement => (
  <tr>
    <td>
      <Link to={`/variables/${variable.id}`}>{variable.name}</Link>
    </td>
    <td>{new Date(variable.updated).toLocaleString()}</td>
  </tr>
);
