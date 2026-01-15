import {Header} from '../components/Header';
import {expect, test} from '../fixtures';

test.describe('Layout', () => {
  test('displays header and menu', async ({page, mock}) => {
    await mock.listCollections();
    await page.goto('/');

    const header = new Header(page);
    await header.verify();

    const menuItems = await header.menu.getItems();
    expect(menuItems).toEqual([
      {href: '#/collections', title: 'Collections'},
      {href: '#/variables', title: 'Variables'},
      {href: '#/jobs', title: 'Jobs'},
    ]);
  });
});
