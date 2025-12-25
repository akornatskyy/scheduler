import {Layout} from '$shared/components';
import {useParams} from 'react-router';
import {JobForm} from '../components/JobForm';
import {useJob} from '../hooks/useJob';

export function JobPage() {
  const {id} = useParams<{id: string}>();

  const {collections, item, pending, errors, mutate, save, remove} = useJob(id);

  return (
    <Layout title={`Job ${item.name}`} errors={errors}>
      <JobForm
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
