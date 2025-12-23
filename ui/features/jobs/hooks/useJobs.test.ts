import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import {useJobs} from './useJobs';

jest.mock('../api');

describe('useJobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => jest.useRealTimers());

  it('updates state with fetched collections/jobs', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({
      items: [{id: 'c1', name: 'Collection #1', state: 'enabled'}],
    });
    jest.mocked(api.listJobs).mockResolvedValue({
      items: [
        {
          id: 'j1',
          name: 'Job #1',
          collectionId: 'c1',
          state: 'enabled',
          schedule: '@every 10m',
          status: 'passing',
        },
      ],
    });

    const {result} = await act(async () => renderHook(() => useJobs('c1')));

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listJobs).toHaveBeenCalledTimes(1);
    expect(api.listJobs).toHaveBeenCalledWith('c1');

    expect(result.current.collections).toEqual([
      {id: 'c1', name: 'Collection #1', state: 'enabled'},
    ]);
    expect(result.current.jobs).toEqual([
      {
        id: 'j1',
        name: 'Job #1',
        collectionId: 'c1',
        state: 'enabled',
        schedule: '@every 10m',
        status: 'passing',
      },
    ]);
    expect(result.current.errors).toBeUndefined();
  });

  it('sets errors when refresh fails', async () => {
    jest.mocked(api.listCollections).mockRejectedValue(new Error('Unexpected'));

    const {result} = await act(async () => renderHook(() => useJobs()));

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(result.current.collections).toEqual([]);
    expect(result.current.jobs).toEqual([]);
    expect(result.current.errors?.__ERROR__).toMatch(/Unexpected/);
  });

  it('re-fetches on interval', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.listJobs).mockResolvedValue({items: []});

    await act(async () => renderHook(() => useJobs('c1')));

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listJobs).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(api.listCollections).toHaveBeenCalledTimes(2);
    expect(api.listJobs).toHaveBeenCalledTimes(2);
  });

  it('re-fetches when collectionId changes', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.listJobs).mockResolvedValue({items: []});

    const {rerender} = await act(async () =>
      renderHook(({collectionId}) => useJobs(collectionId), {
        initialProps: {collectionId: 'c1' as string | null},
      }),
    );

    expect(api.listJobs).toHaveBeenCalledWith('c1');

    await act(async () => rerender({collectionId: 'c2'}));

    expect(api.listJobs).toHaveBeenLastCalledWith('c2');
  });
});
