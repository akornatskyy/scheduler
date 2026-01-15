import {expect, type Locator, type Page} from '@playwright/test';
import {ErrorSummary} from '../components/ErrorSummary';
import type {JobStatus} from '../types';

type JobHistory = {
  action: string | null;
  started: string | null;
  finished: string | null;
  status: string | null;
  retryCount?: number;
  message?: string | null;
};

type JobHistoryData = {
  status: JobStatus;
  history: JobHistory[];
};

export class JobHistoryPage {
  readonly error: ErrorSummary;
  private readonly title: Locator;
  private readonly statusLabel: Locator;
  private readonly runErrorLabel: Locator;
  private readonly lastRunLabel: Locator;
  private readonly nextRunLabel: Locator;
  private readonly table: Locator;
  private readonly runButton: Locator;
  private readonly deleteButton: Locator;

  constructor(private readonly page: Page) {
    this.error = new ErrorSummary(page);
    this.title = page.getByRole('heading', {name: 'Job History', level: 1});
    this.statusLabel = page.getByLabel('status');
    this.runErrorLabel = page.getByLabel('run error count');
    this.lastRunLabel = page.getByLabel('last run');
    this.nextRunLabel = page.getByLabel('next run');
    this.table = page.getByRole('table');
    this.runButton = page.getByRole('button', {name: 'Run'});
    this.deleteButton = page.getByRole('button', {name: 'Delete'});
  }

  async goto(id: string): Promise<void> {
    await Promise.all([this.wait(), this.page.goto(`#/jobs/${id}/history`)]);
    await this.verify();
  }

  async waitForReady(promise: Promise<void>): Promise<void> {
    await Promise.all([this.wait(), promise]);
    await this.verify();
  }

  async wait(): Promise<void> {
    await this.page.waitForURL(/#\/jobs\/[\w-]+\/history$/);
    await Promise.all([
      this.page.waitForResponse('/jobs/*'),
      this.page.waitForResponse('/jobs/*/status'),
      this.page.waitForResponse('/jobs/*/history'),
    ]);
  }

  async verify(): Promise<void> {
    await Promise.all([
      expect(this.title).toBeVisible(),
      expect(this.statusLabel).toBeVisible(),
      expect(this.runErrorLabel).toBeVisible(),
      expect(this.lastRunLabel).toBeVisible(),
      expect(this.nextRunLabel).toBeVisible(),
      expect(this.table).toBeVisible(),
      expect(this.runButton).toBeEnabled(),
      expect(this.deleteButton).toBeVisible(),
    ]);
  }

  async getData(): Promise<JobHistoryData> {
    const [status, count, lastRun, nextRun, rows] = await Promise.all([
      this.statusLabel.textContent(),
      this.runErrorLabel.textContent(),
      this.lastRunLabel.textContent(),
      this.nextRunLabel.textContent(),
      this.table.locator('tbody tr').all(),
    ]);

    let runCount = 0;
    let errorCount = 0;
    if (count) {
      const parts = count.split('/');
      runCount = Number.parseInt(parts[0]);
      errorCount = Number.parseInt(parts[1]);
    }

    const history: JobHistory[] = [];
    for (const row of rows) {
      const cells = row.getByRole('cell');
      const [action, started, finished, status, retryCount, message] =
        await Promise.all([
          cells.nth(0).textContent(),
          cells.nth(1).textContent(),
          cells.nth(2).textContent(),
          cells.nth(3).textContent(),
          cells.nth(4).textContent(),
          cells.nth(5).textContent(),
        ]);
      history.push({
        action,
        started: started ? new Date(started).toISOString() : null,
        finished: finished ? new Date(finished).toISOString() : null,
        status,
        retryCount: retryCount ? Number.parseInt(retryCount) : undefined,
        message: message ? message : undefined,
      });
    }

    return {
      status: {
        running: status === 'Running',
        runCount,
        errorCount,
        lastRun: lastRun ? new Date(lastRun).toISOString() : undefined,
        nextRun: nextRun
          ? nextRun === 'N/A'
            ? undefined
            : new Date(nextRun).toISOString()
          : undefined,
      },
      history,
    };
  }

  run(): Promise<void> {
    return this.runButton.click();
  }

  delete(): Promise<void> {
    return this.deleteButton.click();
  }
}
