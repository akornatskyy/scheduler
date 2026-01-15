import {expect, type Locator, type Page} from '@playwright/test';
import {ErrorSummary} from '../components/ErrorSummary';
import type {Action, JobState, RecursivePartial} from '../types';

type JobInput = {
  name: string;
  collectionId: string;
  schedule: string;
  state: JobState;
  action: Action;
};

export class JobPage {
  readonly error: ErrorSummary;
  private readonly title: Locator;
  private readonly nameInput: Locator;
  private readonly collectionCombobox: Locator;
  private readonly stateRadio: (state: JobState) => Locator;
  private readonly scheduleInput: Locator;
  private readonly methodCombobox: Locator;
  private readonly uriInput: Locator;
  private readonly retryCountInput: Locator;
  private readonly intervalInput: Locator;
  private readonly deadlineInput: Locator;
  private readonly saveButton: Locator;
  private readonly deleteButton: Locator;

  constructor(private readonly page: Page) {
    this.error = new ErrorSummary(page);
    this.title = page.getByRole('heading', {name: 'Job', level: 1});
    const form = page.getByRole('form');
    this.nameInput = form.getByRole('textbox', {name: 'name'}).first();
    this.collectionCombobox = form.getByRole('combobox', {name: 'collection'});
    this.stateRadio = (name) => form.getByRole('radio', {name});
    this.scheduleInput = form.getByRole('textbox', {name: 'schedule'});
    this.methodCombobox = form.getByRole('combobox', {name: 'method'});
    this.uriInput = form.getByRole('textbox', {name: 'uri'});
    this.retryCountInput = form.getByRole('spinbutton', {name: 'retry'});
    this.intervalInput = form.getByRole('textbox', {name: /^Interval$/});
    this.deadlineInput = form.getByRole('textbox', {name: 'deadline'});
    this.saveButton = page.getByRole('button', {name: 'Save'});
    this.deleteButton = page.getByRole('button', {name: 'Delete'});
  }

  async goto(id: string): Promise<void> {
    await Promise.all([this.wait(), this.page.goto(`#/jobs/${id}`)]);
    await this.verify();
  }

  async waitForReady(promise: Promise<void>): Promise<void> {
    await Promise.all([this.wait(), promise]);
    await this.verify();
  }

  async wait(): Promise<void> {
    await this.page.waitForURL(/#\/jobs\/[\w-]+$/);
    const promises = [this.page.waitForResponse('/collections')];
    if (this.getId()) {
      // TODO: there is a race that api call completes earlier
      promises.push(this.page.waitForResponse('/jobs/*'));
    }

    await Promise.all(promises);
  }

  async verify(): Promise<void> {
    await Promise.all([
      expect(this.title).toBeVisible(),
      expect(this.nameInput).toBeVisible(),
      expect(this.collectionCombobox).toBeVisible(),
      expect(this.stateRadio('enabled')).toBeVisible(),
      expect(this.stateRadio('disabled')).toBeVisible(),
      expect(this.scheduleInput).toBeVisible(),
      expect(this.uriInput).toBeVisible(),
      expect(this.retryCountInput).toBeVisible(),
      expect(this.intervalInput).toBeVisible(),
      expect(this.deadlineInput).toBeVisible(),
      expect(this.saveButton).toBeEnabled(),
      expect(this.deleteButton).toBeVisible({visible: !!this.getId()}),
    ]);
  }

  getId(): string | undefined {
    const id = this.page.url().split('/').pop();
    return id === 'add' ? undefined : id;
  }

  async getData(): Promise<JobInput> {
    const [
      name,
      collectionId,
      enabled,
      schedule,
      method,
      uri,
      retryCount,
      retryInterval,
      deadline,
    ] = await Promise.all([
      this.nameInput.inputValue(),
      this.collectionCombobox.inputValue(),
      this.stateRadio('enabled').isChecked(),
      this.scheduleInput.inputValue(),
      this.methodCombobox.inputValue(),
      this.uriInput.inputValue(),
      this.retryCountInput.inputValue(),
      this.intervalInput.inputValue(),
      this.deadlineInput.inputValue(),
    ]);

    return {
      name,
      collectionId,
      schedule,
      state: enabled ? 'enabled' : 'disabled',
      action: {
        request: {method, uri, headers: [], body: ''},
        retryPolicy: {
          retryCount: Number.parseInt(retryCount),
          retryInterval,
          deadline,
        },
      },
    };
  }

  async save(input: RecursivePartial<JobInput>): Promise<void> {
    if (input.name) {
      await this.nameInput.fill(input.name);
    }

    if (input.collectionId) {
      await this.collectionCombobox.selectOption(input.collectionId);
    }

    if (input.schedule) {
      await this.scheduleInput.fill(input.schedule);
    }

    const request = input.action?.request;
    if (request) {
      if (request.uri) {
        await this.uriInput.fill(request.uri);
      }
    }

    await this.saveButton.click();
  }

  delete(): Promise<void> {
    return this.deleteButton.click();
  }
}
