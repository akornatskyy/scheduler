import {useVariable, VariableForm} from '$features/variables';
import {Layout} from '$shared/components';
import {useSignal} from '$shared/hooks';
import {$isPending} from '$shared/signals';
import {useParams} from 'react-router';

export function VariablePage() {
  const {id} = useParams<{id: string}>();

  const {item, collections, errors, mutate, save, remove} = useVariable(id);
  const pending = useSignal($isPending);

  return (
    <Layout title={`Variable ${item.name}`} errors={errors}>
      <VariableForm
        id={id}
        item={item}
        collections={collections}
        pending={pending}
        errors={errors}
        mutate={mutate}
        onSave={save}
        onDelete={remove}
      />
    </Layout>
  );
}
