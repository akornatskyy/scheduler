import {type Locator, type Page, expect} from '@playwright/test';

export class Header {
  private readonly logo: Logo;
  readonly menu: Menu;

  constructor(page: Page) {
    const header = page.getByRole('navigation');
    this.logo = new Logo(header);
    this.menu = new Menu(header);
  }

  async verify(): Promise<void> {
    await Promise.all([this.logo.verify(), this.menu.verify()]);
  }
}

class Logo {
  constructor(private readonly locator: Locator) {}

  async verify(): Promise<void> {
    await expect(this.locator.getByText('Scheduler')).toBeVisible();
  }
}

type MenuItem = {title: string | null; href: string | null};

class Menu {
  constructor(private readonly locator: Locator) {}

  async verify(): Promise<void> {
    await expect(this.locator).toBeVisible();
  }

  async getItems(): Promise<MenuItem[]> {
    const links = await this.locator.getByRole('link').all();
    const items: MenuItem[] = [];
    for (const item of links) {
      const [title, href] = await Promise.all([
        item.textContent(),
        item.getAttribute('href'),
      ]);
      items.push({title, href});
    }

    return items;
  }
}
