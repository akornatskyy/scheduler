import {CollectionTable, useCollections} from '$features/collections';
import {Layout} from '$shared/components';
import {Link} from 'react-router';

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
