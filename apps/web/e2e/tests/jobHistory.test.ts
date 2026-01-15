import {expect, test} from '../fixtures';
import {samples} from '../samples';

test.describe('JobHistoryPage', () => {
  const {id} = samples.jobs[0];

  test('displays a job history', async ({jobHistoryPage}) => {
    await jobHistoryPage.goto(id);

    const actual = await jobHistoryPage.getData();
    expect(actual.status).toEqual(samples.jobStatus);
    expect(actual.history).toEqual(samples.jobHistory);
  });

  test('run triggers a job', async ({jobHistoryPage, page, mock}) => {
    await mock.updateJobStatus();
    await jobHistoryPage.goto(id);

    await Promise.all([
      page.waitForResponse('/jobs/*/status'),
      jobHistoryPage.run(),
    ]);

    await jobHistoryPage.verify();
    await jobHistoryPage.error.expectToBeHidden();
  });

  test('run shows a server error when run fails', async ({
    jobHistoryPage,
    page,
    mock,
  }) => {
    await mock.updateJobStatus(502);
    await jobHistoryPage.goto(id);

    await Promise.all([
      page.waitForResponse('/jobs/*/status'),
      jobHistoryPage.run(),
    ]);

    await jobHistoryPage.verify();
    await jobHistoryPage.error.expectToContainMessage('502');
  });

  test('deletes a job history', async ({jobHistoryPage, jobPage, mock}) => {
    await mock.deleteJobHistory();
    await jobHistoryPage.goto(id);

    await jobPage.waitForReady(jobHistoryPage.delete());
  });
});
