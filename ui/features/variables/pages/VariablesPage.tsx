import {Layout} from '$shared/components';
import {Errors, toErrorMap} from '$shared/errors';
import {useEffect, useMemo, useState} from 'react';
import {Link, useLocation} from 'react-router';
import * as api from '../api';
import {VariableTable} from '../components/VariableTable';
import {CollectionItem, VariableItem} from '../types';

export function VariablesPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [variables, setVariables] = useState<VariableItem[]>([]);
  const [errors, setErrors] = useState<Errors>();

  const location = useLocation();
  const collectionId = useMemo(
    () => new URLSearchParams(location.search).get('collectionId'),
    [location.search],
  );

  useEffect(() => {
    (async () => {
      try {
        const [{items: collections}, {items: variables}] = await Promise.all([
          api.listCollections(),
          api.listVariables(collectionId),
        ]);

        setCollections(collections);
        setVariables(variables);
      } catch (error) {
        setErrors(toErrorMap(error));
      }
    })();
  }, [collectionId]);

  return (
    <Layout title="Variables" errors={errors}>
      <VariableTable collections={collections} variables={variables} />
      <Link to="/variables/add" className="btn btn-primary">
        Add
      </Link>
    </Layout>
  );
}
