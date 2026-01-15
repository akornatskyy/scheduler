import {expect, type Locator, type Page} from '@playwright/test';

export class ErrorSummary {
  private readonly heading: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('alert').getByRole('heading');
  }

  async expectToContainMessage(expected: string): Promise<void> {
    await expect(this.heading).toContainText(expected);
  }

  async expectToBeHidden(): Promise<void> {
    await expect(this.heading).toBeHidden();
  }
}
