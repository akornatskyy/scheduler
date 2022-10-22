import {act, render, screen} from '@testing-library/react';
import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';

import {App} from './index';

describe('index', () => {
  it.each([
    ['/', 'Collections'],
    ['/collections', 'Collections'],
    ['/jobs', 'Jobs'],
    ['/collections/add', 'Collection'],
    ['/collections/65ada2f9', 'Collection'],
    ['/jobs/add', 'Job'],
    ['/jobs/7ce1f17e', 'Job'],
    ['/jobs/7ce1f17e/history', 'Job History'],
  ])('routes %s to %s', async (path, component) => {
    await act(async () => {
      render(
        <Router initialEntries={[path]}>
          <App />
        </Router>,
      );
    });

    expect(screen.getByRole('heading')).toHaveTextContent(component);
  });
});
