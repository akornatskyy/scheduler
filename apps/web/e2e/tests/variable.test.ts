import {test} from '../fixtures';
import {samples} from '../samples';

test.describe('VariablePage', () => {
  const {id} = samples.variables[0];
  const {id: collectionId} = samples.collections[0];

  test('save creates a variable', async ({
    variablePage,
    variablesPage,
    mock,
  }) => {
    await mock.createVariable();
    await variablePage.goto('add');

    await variablesPage.waitForReady(
      variablePage.save({name: 'Var1', collectionId, value: '123'}),
    );
  });

  test('save does nothing when there are no changes', async ({
    variablePage,
    variablesPage,
    mock,
  }) => {
    await mock.updateVariable(503);
    await variablePage.goto(id);

    await variablesPage.waitForReady(variablePage.save({}));
  });

  test('save updates an existing variable', async ({
    variablePage,
    variablesPage,
    mock,
  }) => {
    await mock.updateVariable();
    await variablePage.goto(id);

    await variablesPage.waitForReady(variablePage.save({name: 'Var2'}));
  });

  test('save shows a server error when save fails', async ({
    variablePage,
    mock,
  }) => {
    await mock.updateVariable(502);
    await variablePage.goto(id);

    await variablePage.save({name: 'Var2'});
    await variablePage.error.expectToContainMessage('502');
  });

  test('deletes a variable', async ({variablePage, variablesPage, mock}) => {
    await mock.deleteVariable();
    await variablePage.goto(id);

    await variablesPage.waitForReady(variablePage.delete());
  });
});
