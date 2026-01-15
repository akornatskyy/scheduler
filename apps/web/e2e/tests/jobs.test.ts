import {expect, test} from '../fixtures';
import {JobsPage} from '../pages/JobsPage';
import {samples} from '../samples';

test.describe('JobsPage', () => {
  test('displays empty table', async ({page, mock}) => {
    await mock.listCollections();
    await mock.listJobs([]);

    const jobsPage = new JobsPage(page);
    await jobsPage.goto();

    const rows = await jobsPage.getJobRows();
    expect(rows).toHaveLength(0);
    await jobsPage.error.expectToBeHidden();
  });

  test('displays error message', async ({page}) => {
    await page.route('/jobs?*', (route) => route.abort());
    await page.route('/collections', (route) => route.abort());

    const jobsPage = new JobsPage(page);
    await jobsPage.goto();

    await jobsPage.error.expectToContainMessage('Failed to fetch');
  });

  test('matches data between list and detail view', async ({
    jobsPage,
    collectionPage,
    jobPage,
    page,
  }) => {
    await jobsPage.goto();
    await jobsPage.error.expectToBeHidden();
    const rows = await jobsPage.getJobRows();
    for (const row of rows) {
      if (row.type === 'CollectionItemRow') {
        const expected = await row.getData();

        await collectionPage.waitForReady(row.navigateToCollection());
        expect(collectionPage.getId()).toEqual(expected.id);

        const actual = await collectionPage.getData();
        expect(actual.name).toEqual(expected.name);
      } else {
        const expected = await row.getData();

        await jobPage.waitForReady(row.navigateToJob());
        expect(jobPage.getId()).toEqual(expected.id);

        const actual = await jobPage.getData();
        expect(actual.name).toEqual(expected.name);
        expect(actual.schedule).toEqual(expected.schedule);
      }

      await page.goBack();
      await jobsPage.verify();
    }
  });

  test('navigates to the add page', async ({jobsPage, jobPage, page}) => {
    await jobsPage.goto();
    await jobPage.waitForReady(jobsPage.clickAdd());
    expect(page.url()).toContain('#/jobs/add');

    const data = await jobPage.getData();
    expect(data).toEqual({
      name: '',
      collectionId: samples.collections[0].id,
      schedule: '',
      state: 'enabled',
      action: {
        request: {
          method: 'GET',
          uri: '',
          headers: [],
          body: '',
        },
        retryPolicy: {
          retryCount: 3,
          retryInterval: '10s',
          deadline: '1m',
        },
      },
    });
  });
});
