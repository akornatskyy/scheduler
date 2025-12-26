import {Layout} from '$shared/components';
import {useParams} from 'react-router';
import {CollectionForm} from '../components/CollectionForm';
import {useCollection} from '../hooks/useCollection';

export function CollectionPage() {
  const {id} = useParams<{id: string}>();
  const {item, pending, errors, mutate, save, remove} = useCollection(id);

  return (
    <Layout title={`Collection ${item.name}`} errors={errors}>
      <CollectionForm
        item={item}
        pending={pending}
        errors={errors}
        mutate={mutate}
        onSave={save}
        onDelete={remove}
      />
    </Layout>
  );
}
