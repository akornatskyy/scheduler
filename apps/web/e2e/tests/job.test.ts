import {test} from '../fixtures';
import {samples} from '../samples';

test.describe('JobPage', () => {
  const {id} = samples.jobs[0];
  const {id: collectionId} = samples.collections[0];

  test('save creates a job', async ({jobPage, jobsPage, mock}) => {
    await mock.createJob();
    await jobPage.goto('add');

    await jobsPage.waitForReady(
      jobPage.save({
        name: 'Job #1',
        collectionId,
        schedule: '@every 1h',
        action: {
          request: {uri: 'http://localhost:8080/health'},
        },
      }),
    );
  });

  test('save does nothing when there are no changes', async ({
    jobPage,
    jobsPage,
    mock,
  }) => {
    await mock.updateJob(503);
    await jobPage.goto(id);

    await jobsPage.waitForReady(jobPage.save({}));
  });

  test('save updates an existing job', async ({jobPage, jobsPage, mock}) => {
    await mock.updateJob();
    await jobPage.goto(id);

    await jobsPage.waitForReady(jobPage.save({name: 'Task X'}));
  });

  test('save shows a server error when save fails', async ({jobPage, mock}) => {
    await mock.updateJob(502);
    await jobPage.goto(id);

    await jobPage.save({name: 'Task X'});
    await jobPage.error.expectToContainMessage('502');
  });

  test('deletes a job', async ({jobPage, jobsPage, mock}) => {
    await mock.deleteJob();
    await jobPage.goto(id);

    await jobsPage.waitForReady(jobPage.delete());
  });
});
