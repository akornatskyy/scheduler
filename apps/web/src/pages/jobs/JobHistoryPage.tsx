import {JobHistoryTable, useJobHistory} from '$features/jobs';
import {Layout} from '$shared/components';
import {useParams} from 'react-router';

export function JobHistoryPage() {
  const {id} = useParams<{id: string}>();
  const {job, status, items, errors, back, run, remove} = useJobHistory(id!);

  return (
    <Layout title={`Job History ${job.name}`} errors={errors}>
      <JobHistoryTable
        status={status}
        items={items}
        onBack={back}
        onRun={run}
        onDelete={remove}
      />
    </Layout>
  );
}
