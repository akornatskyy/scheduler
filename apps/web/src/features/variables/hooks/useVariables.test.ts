import {api as collectionsApi} from '$features/collections';
import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import {useVariables} from './useVariables';

jest.mock('$features/collections');
jest.mock('../api');

describe('useVariables', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads collections and variables for given collectionId', async () => {
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App', state: 'enabled'}],
    });
    jest.mocked(api.getVariables).mockResolvedValue({
      items: [
        {
          id: 'c23abe44',
          collectionId: '65ada2f9',
          name: 'My Var',
          updated: '2025-12-30T07:38:17.830',
        },
      ],
    });

    const {result} = await act(() =>
      renderHook(() => useVariables('65ada2f9')),
    );

    expect(collectionsApi.getCollections).toHaveBeenCalledTimes(1);
    expect(collectionsApi.getCollections).toHaveBeenCalledWith();
    expect(api.getVariables).toHaveBeenCalledTimes(1);
    expect(api.getVariables).toHaveBeenCalledWith('65ada2f9');

    expect(result.current.collections).toEqual([
      {id: '65ada2f9', name: 'My App', state: 'enabled'},
    ]);
    expect(result.current.variables).toEqual([
      {
        id: 'c23abe44',
        collectionId: '65ada2f9',
        name: 'My Var',
        updated: '2025-12-30T07:38:17.830',
      },
    ]);
    expect(result.current.errors).toBeUndefined();
  });

  it('sets errors when fetch fails', async () => {
    jest
      .mocked(collectionsApi.getCollections)
      .mockRejectedValue(new Error('unexpected'));
    jest.mocked(api.getVariables).mockResolvedValue({items: []});

    const {result} = await act(() => renderHook(() => useVariables()));

    expect(collectionsApi.getCollections).toHaveBeenCalledTimes(1);
    expect(api.getVariables).toHaveBeenCalledTimes(1);

    expect(result.current.collections).toEqual([]);
    expect(result.current.variables).toEqual([]);
    expect(result.current.errors?.__ERROR__).toMatch(/unexpected/);
  });
});
