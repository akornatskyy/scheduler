import {Layout} from '$shared/components';
import {useSignal} from '$shared/hooks';
import {$isPending} from '$shared/signals';
import {useParams} from 'react-router';
import {JobForm} from '../components/JobForm';
import {useJob} from '../hooks/useJob';

export function JobPage() {
  const {id} = useParams<{id: string}>();

  const {collections, item, errors, mutate, save, remove} = useJob(id);
  const pending = useSignal($isPending);

  return (
    <Layout title={`Job ${item.name}`} errors={errors}>
      <JobForm
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
