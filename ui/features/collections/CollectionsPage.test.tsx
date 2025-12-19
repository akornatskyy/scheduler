import {act, render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import * as api from './api';
import {CollectionsPage} from './CollectionsPage';
import {Collection} from './types';

jest.mock('./api');

describe('collections page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('handles list error', async () => {
    jest.mocked(api.listCollections).mockRejectedValue(new Error('Unexpected'));

    await actRender();

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('updates state with fetched items', async () => {
    const items: Collection[] = [
      {
        id: '65ada2f9',
        name: 'My App #1',
        state: 'enabled',
      },
    ];
    jest.mocked(api.listCollections).mockResolvedValue({items});

    await actRender();

    expect(api.listCollections).toHaveBeenCalled();
    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(screen.getByText('My App #1')).toBeVisible();
  });
});

const actRender = () =>
  act(async () =>
    render(
      <Router>
        <CollectionsPage />
      </Router>,
    ),
  );
