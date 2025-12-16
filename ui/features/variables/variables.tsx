import {useEffect, useMemo, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Layout} from '$shared/components';
import {Errors} from '$shared/types';
import {Collection, Variable} from './types';
import * as api from './variables-api';
import {VariableList} from './variables-components';

export default function VariablesContainer() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  const location = useLocation();
  const collectionId = useMemo(
    () => new URLSearchParams(location.search).get('collectionId'),
    [location.search],
  );

  useEffect(() => {
    api
      .listCollections()
      .then(({items}) => setCollections(items))
      .catch((errors) => setErrors(errors));

    api
      .listVariables(collectionId)
      .then(({items}) => setVariables(items))
      .catch((errors) => setErrors(errors));
  }, [collectionId]);

  return (
    <Layout title="Variables" errors={errors}>
      <VariableList collections={collections} variables={variables} />
      <Link to="/variables/add" className="btn btn-primary">
        Add
      </Link>
    </Layout>
  );
}
