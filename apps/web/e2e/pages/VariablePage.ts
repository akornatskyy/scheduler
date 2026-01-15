import {expect, type Locator, type Page} from '@playwright/test';
import {ErrorSummary} from '../components/ErrorSummary';

type VariableInput = {
  name: string;
  collectionId: string;
  value: string;
};

export class VariablePage {
  readonly error: ErrorSummary;
  private readonly title: Locator;
  private readonly nameInput: Locator;
  private readonly collectionCombobox: Locator;
  private readonly valueInput: Locator;
  private readonly saveButton: Locator;
  private readonly deleteButton: Locator;

  constructor(private readonly page: Page) {
    this.error = new ErrorSummary(page);
    this.title = page.getByRole('heading', {name: 'Variable', level: 1});
    const form = page.getByRole('form');
    this.nameInput = form.getByRole('textbox', {name: 'name'});
    this.collectionCombobox = form.getByRole('combobox', {name: 'collection'});
    this.valueInput = form.getByRole('textbox', {name: 'value'});
    this.saveButton = page.getByRole('button', {name: 'Save'});
    this.deleteButton = page.getByRole('button', {name: 'Delete'});
  }

  async goto(id: string): Promise<void> {
    await Promise.all([this.wait(), this.page.goto(`#/variables/${id}`)]);
    await this.verify();
  }

  async waitForReady(promise: Promise<void>): Promise<void> {
    await Promise.all([this.wait(), promise]);
    await this.verify();
  }

  async wait(): Promise<void> {
    await this.page.waitForURL(/#\/variables\/[\w-]+$/);
    const promises = [this.page.waitForResponse('/collections')];
    if (this.getId()) {
      // TODO: there is a race that api call completes earlier
      promises.push(this.page.waitForResponse('/variables/*'));
    }

    await Promise.all(promises);
  }

  async verify(): Promise<void> {
    await Promise.all([
      expect(this.title).toBeVisible(),
      expect(this.nameInput).toBeVisible(),
      expect(this.collectionCombobox).toBeVisible(),
      expect(this.valueInput).toBeVisible(),
      expect(this.saveButton).toBeEnabled(),
      expect(this.deleteButton).toBeVisible({visible: !!this.getId()}),
    ]);
  }

  getId(): string | undefined {
    const id = this.page.url().split('/').pop();
    return id === 'add' ? undefined : id;
  }

  async getData(): Promise<VariableInput> {
    const [name, collectionId, value] = await Promise.all([
      this.nameInput.inputValue(),
      this.collectionCombobox.inputValue(),
      this.valueInput.inputValue(),
    ]);

    return {
      name,
      collectionId,
      value,
    };
  }

  async save(input: Partial<VariableInput>): Promise<void> {
    if (input.name) {
      await this.nameInput.fill(input.name);
    }

    if (input.collectionId) {
      await this.collectionCombobox.selectOption(input.collectionId);
    }

    if (input.value) {
      await this.valueInput.fill(input.value);
    }

    await this.saveButton.click();
  }

  delete(): Promise<void> {
    return this.deleteButton.click();
  }
}
