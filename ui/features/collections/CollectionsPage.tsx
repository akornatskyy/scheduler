import {Layout} from '$shared/components';
import {Errors, toErrorMap} from '$shared/errors';
import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import * as api from './api';
import {CollectionTable} from './components/CollectionTable';
import {Collection} from './types';

export function CollectionsPage() {
  const [items, setItems] = useState<Collection[]>([]);
  const [errors, setErrors] = useState<Errors>();

  useEffect(() => {
    (async () => {
      try {
        const {items} = await api.listCollections();
        setItems(items);
      } catch (error) {
        setErrors(toErrorMap(error));
      }
    })();
  }, []);

  return (
    <Layout title="Collections" errors={errors}>
      <CollectionTable items={items} />
      <Link to="/collections/add" className="btn btn-primary">
        Add
      </Link>
    </Layout>
  );
}
