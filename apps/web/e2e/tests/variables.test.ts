import {expect, test} from '../fixtures';
import {VariablesPage} from '../pages/VariablesPage';
import {samples} from '../samples';

test.describe('VariablesPage', () => {
  test('displays empty table', async ({page, mock}) => {
    await mock.listCollections();
    await mock.listVariables([]);

    const variablesPage = new VariablesPage(page);
    await variablesPage.goto();

    const rows = await variablesPage.getVariableRows();
    expect(rows).toHaveLength(0);
    await variablesPage.error.expectToBeHidden();
  });

  test('displays error message', async ({page}) => {
    await page.route('/variables', (route) => route.abort());
    await page.route('/collections', (route) => route.abort());

    const variablesPage = new VariablesPage(page);
    await variablesPage.goto();

    await variablesPage.error.expectToContainMessage('Failed to fetch');
  });

  test('matches data between list and detail view', async ({
    variablesPage,
    collectionPage,
    variablePage,
    page,
  }) => {
    await variablesPage.goto();
    await variablesPage.error.expectToBeHidden();
    const rows = await variablesPage.getVariableRows();
    for (const row of rows) {
      if (row.type === 'CollectionItemRow') {
        const expected = await row.getData();

        await collectionPage.waitForReady(row.navigateToCollection());
        expect(collectionPage.getId()).toEqual(expected.id);

        const actual = await collectionPage.getData();
        expect(actual.name).toEqual(expected.name);
      } else {
        const expected = await row.getData();

        await variablePage.waitForReady(row.navigateToVariable());
        expect(variablePage.getId()).toEqual(expected.id);

        const actual = await variablePage.getData();
        expect(actual.name).toEqual(expected.name);
      }

      await page.goBack();
      await variablesPage.verify();
    }
  });

  test('navigates to the add page', async ({
    variablesPage,
    variablePage,
    page,
  }) => {
    await variablesPage.goto();
    await variablePage.waitForReady(variablesPage.clickAdd());
    expect(page.url()).toContain('#/variables/add');

    const data = await variablePage.getData();
    expect(data).toEqual({
      name: '',
      collectionId: samples.collections[0].id,
      value: '',
    });
  });
});
