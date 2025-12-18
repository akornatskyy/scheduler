import {act, render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import JobsContainer from './jobs';
import * as api from './jobs-api';
import {Job} from './types';

jest.mock('./jobs-api');

describe('jobs container', () => {
  beforeEach(() => jest.clearAllMocks());

  it('handles list collections error', async () => {
    jest.mocked(api.listCollections).mockRejectedValue(new Error('Unexpected'));
    jest.mocked(api.listJobs).mockResolvedValue({items: []});

    await actRender();

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(api.listJobs).toHaveBeenCalledTimes(1);
    expect(api.listJobs).toHaveBeenCalledWith(null);
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('handles list jobs error', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.listJobs).mockRejectedValue(new Error('Unexpected'));

    await actRender();

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(api.listJobs).toHaveBeenCalledTimes(1);
    expect(api.listJobs).toHaveBeenCalledWith(null);
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('updates state with fetched items', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });
    jest.mocked(api.listJobs).mockResolvedValue({
      items: [
        {
          id: '845ab32f',
          collectionId: '65ada2f9',
        } as Job,
      ],
    });

    await act(async () => {
      render(
        <Router initialEntries={['/?collectionId=65ada2f9']}>
          <JobsContainer />
        </Router>,
      );
    });

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(api.listJobs).toHaveBeenCalledTimes(1);
    expect(api.listJobs).toHaveBeenCalledWith('65ada2f9');
  });

  it('refreshes on timer', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    jest.mocked(api.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.listJobs).mockResolvedValue({items: []});

    await actRender();
    jest.runOnlyPendingTimers();

    await waitFor(() => expect(api.listCollections).toHaveBeenCalledTimes(2));
    expect(api.listJobs).toHaveBeenCalledTimes(2);
    expect(setInterval).toHaveBeenCalledTimes(1);
  });

  it('clears timer on unmount', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    jest.spyOn(global, 'clearInterval');
    jest.mocked(api.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.listJobs).mockResolvedValue({items: []});

    const {unmount} = await actRender();

    await waitFor(() => expect(api.listCollections).toHaveBeenCalledTimes(1));
    expect(api.listJobs).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledWith(expect.anything(), 10000);

    unmount();

    expect(clearInterval).toHaveBeenCalledTimes(1);
  });
});

const actRender = () =>
  act(async () =>
    render(
      <Router>
        <JobsContainer />
      </Router>,
    ),
  );
