import {CollectionForm, useCollection} from '$features/collections';
import {Layout} from '$shared/components';
import {useSignal} from '$shared/hooks';
import {$isPending} from '$shared/signals';
import {useParams} from 'react-router';

export function CollectionPage() {
  const {id} = useParams<{id: string}>();
  const {item, errors, mutate, save, remove} = useCollection(id);
  const pending = useSignal($isPending);

  return (
    <Layout title={`Collection ${item.name}`} errors={errors}>
      <CollectionForm
        id={id}
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
