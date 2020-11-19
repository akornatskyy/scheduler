import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';
import {render, screen, waitFor} from '@testing-library/react';

import * as api from './variables-api';
import Variables from './variables';

jest.mock('./variables-api');

describe('variables', () => {
  const props = {
    location: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles list collections error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockRejectedValue(errors);
    api.listVariables.mockResolvedValue({items: []});

    render(<Router><Variables {...props} /></Router>);

    await waitFor(() => expect(api.listCollections).toBeCalledTimes(1));
    expect(api.listCollections).toBeCalledWith();
    expect(api.listVariables).toBeCalledTimes(1);
    expect(api.listVariables).toBeCalledWith(null);
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles list variables error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockResolvedValue({items: []});
    api.listVariables.mockRejectedValue(errors);

    render(<Router><Variables {...props} /></Router>);

    await waitFor(() => expect(api.listCollections).toBeCalledTimes(1));
    expect(api.listCollections).toBeCalledWith();
    expect(api.listVariables).toBeCalledTimes(1);
    expect(api.listVariables).toBeCalledWith(null);
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('updates state with fetched items', async () => {
    api.listCollections.mockResolvedValue({
      items: [{
        id: '65ada2f9',
        name: 'My App',
      }]
    });
    api.listVariables.mockResolvedValue({
      items: [{
        id: 'c23abe44',
        collectionId: '65ada2f9',
        name: 'My Var',
      }]
    });

    render(
        <Router>
          <Variables
            {...props}
            location={{search: '?collectionId=65ada2f9'}}
          />
        </Router>
    );

    await waitFor(() => expect(api.listCollections).toBeCalledTimes(1));
    expect(api.listCollections).toBeCalledWith();
    expect(api.listVariables).toBeCalledTimes(1);
    expect(api.listVariables).toBeCalledWith('65ada2f9');
    expect(screen.getByText('My App')).toBeVisible();
    expect(screen.getByText('My Var')).toBeVisible();
  });
});
