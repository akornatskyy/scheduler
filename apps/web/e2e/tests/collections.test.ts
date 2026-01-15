import {expect, test} from '../fixtures';
import {CollectionsPage} from '../pages/CollectionsPage';

test.describe('CollectionsPage', () => {
  test('displays empty table', async ({page, mock}) => {
    await mock.listCollections([]);

    const collectionsPage = new CollectionsPage(page);
    await collectionsPage.goto();

    const rows = await collectionsPage.getCollectionRows();
    expect(rows).toHaveLength(0);
    await collectionsPage.error.expectToBeHidden();
  });

  test('displays error message', async ({page}) => {
    await page.route('/collections', (route) => route.abort());

    const collectionsPage = new CollectionsPage(page);
    await collectionsPage.goto();

    await collectionsPage.error.expectToContainMessage('Failed to fetch');
  });

  test('matches data between list and detail view', async ({
    collectionsPage,
    collectionPage,
    page,
  }) => {
    await collectionsPage.goto();
    await collectionsPage.error.expectToBeHidden();
    const rows = await collectionsPage.getCollectionRows();
    for (const row of rows) {
      const expected = await row.getData();

      await collectionPage.waitForReady(row.navigateToCollection());
      expect(collectionPage.getId()).toEqual(expected.id);

      const actual = await collectionPage.getData();
      expect(actual.name).toEqual(expected.name);
      expect(actual.state).toEqual(expected.state);

      await page.goBack();
      await collectionsPage.verify();
    }
  });

  test('navigates to the add page', async ({
    collectionsPage,
    collectionPage,
    page,
  }) => {
    await collectionsPage.goto();
    await collectionPage.waitForReady(collectionsPage.clickAdd());
    expect(page.url()).toContain('#/collections/add');

    const data = await collectionPage.getData();
    expect(data).toEqual({
      name: '',
      state: 'enabled',
    });
  });
});
