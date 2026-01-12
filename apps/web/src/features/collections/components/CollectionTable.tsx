import {Table} from 'react-bootstrap';
import {Link} from 'react-router';
import type {CollectionItem} from '../types';

type Props = {
  items: CollectionItem[];
};

export const CollectionTable = ({items}: Props) => (
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
            <Link to={`/collections/${i.id}`}>{i.name}</Link>
            <Link to={`/variables?collectionId=${i.id}`}>
              <span className="badge bg-light mx-1">variables</span>
            </Link>
            <Link to={`/jobs?collectionId=${i.id}`}>
              <span className="badge bg-light">jobs</span>
            </Link>
          </td>
          <td>{i.state}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);
