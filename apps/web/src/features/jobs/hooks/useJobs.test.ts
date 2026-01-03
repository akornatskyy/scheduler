import {api as collectionsApi} from '$features/collections';
import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import {useJobs} from './useJobs';

jest.mock('$features/collections');
jest.mock('../api');

describe('useJobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => jest.useRealTimers());

  it('updates state with fetched collections/jobs', async () => {
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({
      items: [{id: 'c1', name: 'Collection #1', state: 'enabled'}],
    });
    jest.mocked(api.getJobs).mockResolvedValue({
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

    expect(collectionsApi.getCollections).toHaveBeenCalledTimes(1);
    expect(api.getJobs).toHaveBeenCalledTimes(1);
    expect(api.getJobs).toHaveBeenCalledWith('c1');

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
    jest
      .mocked(collectionsApi.getCollections)
      .mockRejectedValue(new Error('unexpected'));

    const {result} = await act(async () => renderHook(() => useJobs()));

    expect(collectionsApi.getCollections).toHaveBeenCalledTimes(1);
    expect(result.current.collections).toEqual([]);
    expect(result.current.jobs).toEqual([]);
    expect(result.current.errors?.__ERROR__).toMatch(/unexpected/);
  });

  it('re-fetches on interval', async () => {
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({items: []});
    jest.mocked(api.getJobs).mockResolvedValue({items: []});

    await act(async () => renderHook(() => useJobs('c1')));

    expect(collectionsApi.getCollections).toHaveBeenCalledTimes(1);
    expect(api.getJobs).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(collectionsApi.getCollections).toHaveBeenCalledTimes(2);
    expect(api.getJobs).toHaveBeenCalledTimes(2);
  });

  it('re-fetches when collectionId changes', async () => {
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({items: []});
    jest.mocked(api.getJobs).mockResolvedValue({items: []});

    const {rerender} = await act(async () =>
      renderHook(({collectionId}) => useJobs(collectionId), {
        initialProps: {collectionId: 'c1' as string | null},
      }),
    );

    expect(api.getJobs).toHaveBeenCalledWith('c1');

    await act(async () => rerender({collectionId: 'c2'}));

    expect(api.getJobs).toHaveBeenLastCalledWith('c2');
  });
});
