import {act, render, screen} from '@testing-library/react';
import {createMemoryRouter, RouterProvider} from 'react-router';
import {routes} from './routes';

describe('routes', () => {
  if (!global.Request) {
    (global.Request as unknown) = class Request {
      method = 'GET';
    };
  }

  it.each([
    ['/', 'Collections'],
    ['/collections', 'Collections'],
    ['/jobs', 'Jobs'],
    ['/collections/add', 'Collection'],
    ['/collections/65ada2f9', 'Collection'],
    ['/jobs/add', 'Job'],
    ['/jobs/7ce1f17e', 'Job'],
    ['/jobs/7ce1f17e/history', 'Job History'],
  ])('routes %s to %s', async (path, content) => {
    const router = createMemoryRouter(routes, {initialEntries: [path]});

    await act(async () => render(<RouterProvider router={router} />));

    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(content);
  });
});
