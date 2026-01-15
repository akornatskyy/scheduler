import {test} from '../fixtures';
import {samples} from '../samples';

test.describe('CollectionPage', () => {
  const {id} = samples.collections[0];

  test('save creates a collection', async ({
    collectionPage,
    collectionsPage,
    mock,
  }) => {
    await mock.createCollection();
    await collectionPage.goto('add');

    await collectionsPage.waitForReady(
      collectionPage.save({name: 'MyApp', state: 'enabled'}),
    );
  });

  test('save does nothing when there are no changes', async ({
    collectionPage,
    collectionsPage,
    mock,
  }) => {
    await mock.updateCollection(503);
    await collectionPage.goto(id);

    await collectionsPage.waitForReady(collectionPage.save({}));
  });

  test('save updates an existing collection', async ({
    collectionPage,
    collectionsPage,
    mock,
  }) => {
    await mock.updateCollection();
    await collectionPage.goto(id);

    await collectionsPage.waitForReady(
      collectionPage.save({name: 'Updated', state: 'disabled'}),
    );
  });

  test('save shows a server error when save fails', async ({
    collectionPage,
    mock,
  }) => {
    await mock.updateCollection(502);
    await collectionPage.goto(id);

    await collectionPage.save({state: 'disabled'});
    await collectionPage.error.expectToContainMessage('502');
  });

  test('deletes a collection', async ({
    collectionPage,
    collectionsPage,
    mock,
  }) => {
    await mock.deleteCollection();
    await collectionPage.goto(id);

    await collectionsPage.waitForReady(collectionPage.delete());
  });
});
