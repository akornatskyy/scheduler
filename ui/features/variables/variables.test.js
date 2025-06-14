import {act, render, screen} from '@testing-library/react';
import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';

import Variables from './variables';
import * as api from './variables-api';

jest.mock('./variables-api');

describe('variables', () => {
  const props = {
    location: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles list collections error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockRejectedValue(errors);
    api.listVariables.mockResolvedValue({items: []});

    await act(async () => {
      render(
        <Router>
          <Variables {...props} />
        </Router>,
      );
    });

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(api.listVariables).toHaveBeenCalledTimes(1);
    expect(api.listVariables).toHaveBeenCalledWith(null);
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles list variables error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockResolvedValue({items: []});
    api.listVariables.mockRejectedValue(errors);

    await act(async () => {
      render(
        <Router>
          <Variables {...props} />
        </Router>,
      );
    });

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(api.listVariables).toHaveBeenCalledTimes(1);
    expect(api.listVariables).toHaveBeenCalledWith(null);
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('updates state with fetched items', async () => {
    api.listCollections.mockResolvedValue({
      items: [
        {
          id: '65ada2f9',
          name: 'My App',
        },
      ],
    });
    api.listVariables.mockResolvedValue({
      items: [
        {
          id: 'c23abe44',
          collectionId: '65ada2f9',
          name: 'My Var',
        },
      ],
    });

    await act(async () => {
      render(
        <Router>
          <Variables {...props} location={{search: '?collectionId=65ada2f9'}} />
        </Router>,
      );
    });

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(api.listVariables).toHaveBeenCalledTimes(1);
    expect(api.listVariables).toHaveBeenCalledWith('65ada2f9');
    expect(screen.getByText('My App')).toBeVisible();
    expect(screen.getByText('My Var')).toBeVisible();
  });
});
