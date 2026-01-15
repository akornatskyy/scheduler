import {expect, type Locator, type Page} from '@playwright/test';
import {ErrorSummary} from '../components/ErrorSummary';

type CollectionItem = {
  id?: string;
  name: string | null;
};

type JobItem = {
  id?: string;
  name: string | null;
  schedule: string | null;
  status: string | null;
};

export class JobsPage {
  readonly error: ErrorSummary;
  private readonly title: Locator;
  private readonly table: Locator;
  private readonly addButton: Locator;

  constructor(private readonly page: Page) {
    this.error = new ErrorSummary(page);
    this.title = page.getByRole('heading', {name: 'Jobs', level: 1});
    this.table = page.getByRole('table');
    this.addButton = page.getByRole('link', {name: 'Add'});
  }

  async goto(): Promise<void> {
    await Promise.all([this.wait(), this.page.goto('#/jobs')]);
    await this.verify();
  }

  async waitForReady(promise: Promise<void>): Promise<void> {
    await Promise.all([this.wait(), promise]);
    await this.verify();
  }

  async wait(): Promise<void> {
    await Promise.all([
      this.page.waitForURL('#/jobs'),
      this.page.waitForRequest('/collections').then((r) => r.response()),
      this.page.waitForRequest('/jobs?*').then((r) => r.response()),
    ]);
  }

  async verify(): Promise<void> {
    await Promise.all([
      expect(this.title).toBeVisible(),
      expect(this.table).toBeVisible(),
      expect(this.addButton).toBeEnabled(),
    ]);
  }

  async getJobRows(): Promise<(CollectionItemRow | JobItemRow)[]> {
    const rows = await this.table.locator('tbody tr').all();
    const r: (CollectionItemRow | JobItemRow)[] = [];
    for (const row of rows) {
      const count = await row.getByRole('cell').count();
      r.push(count === 1 ? new CollectionItemRow(row) : new JobItemRow(row));
    }

    return r;
  }

  clickAdd(): Promise<void> {
    return this.addButton.click();
  }
}

class CollectionItemRow {
  readonly type = 'CollectionItemRow';

  constructor(private readonly row: Locator) {}

  async getData(): Promise<CollectionItem> {
    const link = this.row.getByRole('link').first();

    const [name, href] = await Promise.all([
      link.textContent(),
      link.getAttribute('href'),
    ]);
    const id = href?.split('/').pop();

    return {id, name};
  }

  navigateToCollection(): Promise<void> {
    return this.row.getByRole('link').first().click();
  }
}

class JobItemRow {
  readonly type = 'JobItemRow';

  constructor(private readonly row: Locator) {}

  async getData(): Promise<JobItem> {
    const cells = this.row.getByRole('cell');
    const link = this.row.getByRole('link').first();

    const [name, href, schedule, status] = await Promise.all([
      link.textContent(),
      link.getAttribute('href'),
      cells.nth(1).textContent(),
      cells.nth(2).textContent(),
    ]);
    const id = href?.split('/').pop();

    return {id, name, schedule, status};
  }

  navigateToJob(): Promise<void> {
    return this.row.getByRole('link').first().click();
  }
}
