import {render, screen} from '@testing-library/react';
import {Footer} from './Footer';

describe('footer component', () => {
  it('renders fallback version when VERSION is not set', async () => {
    delete process.env.VERSION;

    // Footer reads VERSION at module-evaluation time.
    jest.resetModules();

    const {Footer: FooterWithVersion} = await import('./Footer');

    render(<FooterWithVersion />);

    expect(screen.getByText(/0\.0\.0-dev/)).toBeVisible();
  });

  it('renders VERSION when set', async () => {
    process.env.VERSION = '1.2.3';

    // Footer reads VERSION at module-evaluation time.
    jest.resetModules();

    const {Footer: FooterWithVersion} = await import('./Footer');

    render(<FooterWithVersion />);

    expect(screen.getByText(/1\.2\.3/)).toBeVisible();
  });

  it('renders current year', () => {
    render(<Footer />);

    expect(
      screen.getByText(new RegExp(String(new Date().getFullYear()))),
    ).toBeVisible();
  });

  it('renders a link to documentation', () => {
    render(<Footer />);

    expect(screen.getByRole('link', {name: 'Documentation'})).toHaveAttribute(
      'href',
      'https://github.com/akornatskyy/scheduler',
    );
  });
});
