import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';
import {render, screen, waitFor} from '@testing-library/react';

import * as api from './collections-api';
import Collections from './collections';

jest.mock('./collections-api');

describe('collections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles list error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockRejectedValue(errors);

    render(<Router><Collections /></Router>);

    await waitFor(() => expect(api.listCollections).toBeCalledTimes(1));
    expect(api.listCollections).toBeCalledWith();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('updates state with fetched items', async () => {
    const items = [{
      id: '65ada2f9',
      name: 'My App #1',
      state: 'enabled'
    }];
    api.listCollections.mockResolvedValue({items});

    render(<Router><Collections /></Router>);

    await waitFor(() => expect(api.listCollections).toBeCalled());
    expect(api.listCollections).toBeCalledTimes(1);
    expect(screen.getByText('My App #1')).toBeVisible();
  });
});
