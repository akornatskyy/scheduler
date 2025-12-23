import {Layout} from '$shared/components';
import {useParams} from 'react-router';
import {CollectionForm} from '../components/CollectionForm';
import {useCollection} from '../hooks/useCollection';

export function CollectionPage() {
  const {id} = useParams<{id: string}>();
  const {item, pending, errors, updateField, save, remove} = useCollection(id);

  return (
    <Layout title={`Collection ${item.name}`} errors={errors}>
      <CollectionForm
        item={item}
        pending={pending}
        errors={errors}
        onChange={updateField}
        onSave={save}
        onDelete={remove}
      />
    </Layout>
  );
}
