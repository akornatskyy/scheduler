import {expect, type Locator, type Page} from '@playwright/test';
import {ErrorSummary} from '../components/ErrorSummary';

type CollectionItem = {
  id: string | undefined;
  name: string | null;
  state: string | null;
};

export class CollectionsPage {
  readonly error: ErrorSummary;
  private readonly title: Locator;
  private readonly table: Locator;
  private readonly addButton: Locator;

  constructor(private readonly page: Page) {
    this.error = new ErrorSummary(page);
    this.title = page.getByRole('heading', {name: 'Collections', level: 1});
    this.table = page.getByRole('table');
    this.addButton = page.getByRole('link', {name: 'Add'});
  }

  async goto(): Promise<void> {
    await Promise.all([this.wait(), this.page.goto('#/collections')]);
    await this.verify();
  }

  async waitForReady(promise: Promise<void>): Promise<void> {
    await Promise.all([this.wait(), promise]);
    await this.verify();
  }

  async wait(): Promise<void> {
    await Promise.all([
      this.page.waitForURL('#/collections'),
      this.page.waitForRequest('/collections').then((r) => r.response()),
    ]);
  }

  async verify(): Promise<void> {
    await Promise.all([
      expect(this.title).toBeVisible(),
      expect(this.table).toBeVisible(),
      expect(this.addButton).toBeEnabled(),
    ]);
  }

  async getCollectionRows(): Promise<CollectionItemRow[]> {
    const rows = await this.table.locator('tbody tr').all();
    return rows.map((row) => new CollectionItemRow(row));
  }

  clickAdd(): Promise<void> {
    return this.addButton.click();
  }
}

class CollectionItemRow {
  constructor(private readonly row: Locator) {}

  async getData(): Promise<CollectionItem> {
    const cells = this.row.getByRole('cell');
    const link = this.row.getByRole('link').first();

    const [name, href, state] = await Promise.all([
      link.textContent(),
      link.getAttribute('href'),
      cells.nth(1).textContent(),
    ]);

    const id = href?.split('/').pop();
    return {id, name, state};
  }

  navigateToCollection(): Promise<void> {
    return this.row.getByRole('link').first().click();
  }
}
