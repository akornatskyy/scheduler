import {Layout} from '$shared/components';
import {Link} from 'react-router';
import {CollectionTable} from '../components/CollectionTable';
import {useCollections} from '../hooks/useCollections';

export function CollectionsPage() {
  const {items, errors} = useCollections();

  return (
    <Layout title="Collections" errors={errors}>
      <CollectionTable items={items} />
      <Link to="/collections/add" className="btn btn-primary">
        Add
      </Link>
    </Layout>
  );
}
