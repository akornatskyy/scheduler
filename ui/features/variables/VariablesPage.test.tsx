import {act, render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import * as api from './api';
import {VariablesPage} from './VariablesPage';

jest.mock('./api');

describe('variables page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('handles list collections error', async () => {
    jest.mocked(api.listCollections).mockRejectedValue(new Error('Unexpected'));
    jest.mocked(api.listVariables).mockResolvedValue({items: []});

    await actRender();

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(api.listVariables).toHaveBeenCalledTimes(1);
    expect(api.listVariables).toHaveBeenCalledWith(null);
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('handles list variables error', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.listVariables).mockRejectedValue(new Error('Unexpected'));

    await actRender();

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(api.listVariables).toHaveBeenCalledTimes(1);
    expect(api.listVariables).toHaveBeenCalledWith(null);
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('updates state with fetched items', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({
      items: [
        {
          id: '65ada2f9',
          name: 'My App',
          state: 'enabled',
        },
      ],
    });
    jest.mocked(api.listVariables).mockResolvedValue({
      items: [
        {
          id: 'c23abe44',
          collectionId: '65ada2f9',
          name: 'My Var',
          updated: '2025-12-15T19:16:44.057',
        },
      ],
    });

    await act(async () => {
      render(
        <Router initialEntries={['/variables?collectionId=65ada2f9']}>
          <VariablesPage />
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

const actRender = () =>
  act(async () =>
    render(
      <Router>
        <VariablesPage />
      </Router>,
    ),
  );
