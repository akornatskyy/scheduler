import {expect, type Locator, type Page} from '@playwright/test';
import {ErrorSummary} from '../components/ErrorSummary';
import type {CollectionState} from '../types';

type CollectionInput = {
  name: string;
  state: CollectionState;
};

export class CollectionPage {
  readonly error: ErrorSummary;
  private readonly title: Locator;
  private readonly nameInput: Locator;
  private readonly stateRadio: (state: CollectionState) => Locator;
  private readonly saveButton: Locator;
  private readonly deleteButton: Locator;

  constructor(private readonly page: Page) {
    this.error = new ErrorSummary(page);
    this.title = page.getByRole('heading', {name: 'Collection', level: 1});
    const form = page.getByRole('form');
    this.nameInput = form.getByRole('textbox', {name: 'name'});
    this.stateRadio = (name) => form.getByRole('radio', {name});
    this.saveButton = page.getByRole('button', {name: 'Save'});
    this.deleteButton = page.getByRole('button', {name: 'Delete'});
  }

  async goto(id: string): Promise<void> {
    await Promise.all([this.wait(), this.page.goto(`#/collections/${id}`)]);
    await this.verify();
  }

  async waitForReady(promise: Promise<void>): Promise<void> {
    await Promise.all([this.wait(), promise]);
    await this.verify();
  }

  async wait(): Promise<void> {
    await this.page.waitForURL(/#\/collections\/[\w-]+$/);
    if (this.getId()) {
      // TODO: there is a race that api call completes earlier
      await this.page.waitForResponse('/collections/*');
    }
  }

  async verify(): Promise<void> {
    await Promise.all([
      expect(this.title).toBeVisible(),
      expect(this.nameInput).toBeVisible(),
      expect(this.stateRadio('enabled')).toBeVisible(),
      expect(this.stateRadio('disabled')).toBeVisible(),
      expect(this.saveButton).toBeEnabled(),
      expect(this.deleteButton).toBeVisible({visible: !!this.getId()}),
    ]);
  }

  getId(): string | undefined {
    const id = this.page.url().split('/').pop();
    return id === 'add' ? undefined : id;
  }

  async getData(): Promise<CollectionInput> {
    const [name, enabled] = await Promise.all([
      this.nameInput.inputValue(),
      this.stateRadio('enabled').isChecked(),
    ]);

    return {
      name,
      state: enabled ? 'enabled' : 'disabled',
    };
  }

  async save(input: Partial<CollectionInput>): Promise<void> {
    if (input.name) {
      await this.nameInput.fill(input.name);
    }

    if (input.state) {
      await this.stateRadio(input.state).check();
    }

    await this.saveButton.click();
  }

  delete(): Promise<void> {
    return this.deleteButton.click();
  }
}
