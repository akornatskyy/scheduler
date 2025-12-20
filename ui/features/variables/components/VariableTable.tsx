import {GroupByList} from '$shared/components';
import {Table} from 'react-bootstrap';
import {Link} from 'react-router';
import {CollectionItem, VariableItem} from '../types';

type VariableListProps = {
  collections: CollectionItem[];
  variables: VariableItem[];
};

export const VariableTable = ({collections, variables}: VariableListProps) => (
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
  collection: CollectionItem;
};

export const GroupRow = ({collection}: GroupRowProps) => (
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
  variable: VariableItem;
};

export const ItemRow = ({variable}: ItemRowProps) => (
  <tr>
    <td>
      <Link to={`/variables/${variable.id}`}>{variable.name}</Link>
    </td>
    <td>{new Date(variable.updated).toLocaleString()}</td>
  </tr>
);
