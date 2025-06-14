import {act, render, screen} from '@testing-library/react';
import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';

import Collections from './collections';
import * as api from './collections-api';

jest.mock('./collections-api');

describe('collections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles list error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockRejectedValue(errors);

    await act(async () => {
      render(
        <Router>
          <Collections />
        </Router>,
      );
    });
    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('updates state with fetched items', async () => {
    const items = [
      {
        id: '65ada2f9',
        name: 'My App #1',
        state: 'enabled',
      },
    ];
    api.listCollections.mockResolvedValue({items});

    await act(async () => {
      render(
        <Router>
          <Collections />
        </Router>,
      );
    });

    expect(api.listCollections).toHaveBeenCalled();
    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(screen.getByText('My App #1')).toBeVisible();
  });
});
