import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {Layout} from '../../shared/components';
import {Errors} from '../../shared/types';
import * as api from './collections-api';
import {CollectionList} from './collections-components';
import {Collection} from './types';

export default function CollectionsContainer() {
  const [items, setItems] = useState<Collection[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    api
      .listCollections()
      .then(({items}) => setItems(items))
      .catch((errors) => setErrors(errors));
  }, []);

  return (
    <Layout title="Collections" errors={errors}>
      <CollectionList items={items} />
      <Link to="/collections/add" className="btn btn-primary">
        Add
      </Link>
    </Layout>
  );
}
