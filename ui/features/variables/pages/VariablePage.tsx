import {Layout} from '$shared/components';
import {useParams} from 'react-router';
import {VariableForm} from '../components/VariableForm';
import {useVariable} from '../hooks/useVariable';

export function VariablePage() {
  const {id} = useParams<{id: string}>();

  const {item, collections, pending, errors, updateField, save, remove} =
    useVariable(id);

  return (
    <Layout title={`Variable ${item.name}`} errors={errors}>
      <VariableForm
        item={item}
        collections={collections}
        pending={pending}
        errors={errors}
        onChange={updateField}
        onSave={save}
        onDelete={remove}
      />
    </Layout>
  );
}
