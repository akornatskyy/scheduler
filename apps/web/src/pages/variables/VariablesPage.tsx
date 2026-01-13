import {useVariables, VariableTable} from '$features/variables';
import {Layout} from '$shared/components';
import {useMemo} from 'react';
import {Link, useLocation} from 'react-router';

export function VariablesPage() {
  const location = useLocation();
  const collectionId = useMemo(
    () => new URLSearchParams(location.search).get('collectionId'),
    [location.search],
  );

  const {collections, variables, errors} = useVariables(collectionId);

  return (
    <Layout title="Variables" errors={errors}>
      <VariableTable collections={collections} variables={variables} />
      <Link to="/variables/add" className="btn btn-primary">
        Add
      </Link>
    </Layout>
  );
}
