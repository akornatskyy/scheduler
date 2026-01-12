import {
  type CollectionItem,
  api as collectionsApi,
} from '$features/collections';
import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import type {VariableItem} from '../types';
import {useVariables} from './useVariables';

jest.mock('$features/collections');
jest.mock('../api');

describe('useVariables', () => {
  const collections: CollectionItem[] = [
    {id: 'c1', name: 'My App', state: 'enabled'},
  ];
  const items: VariableItem[] = [
    {
      id: 'v1',
      collectionId: 'c1',
      name: 'My Var',
      updated: '2025-12-30T07:38:17.830',
    },
  ];

  beforeEach(() => jest.clearAllMocks());

  it('loads collections and variables for given collectionId', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });
    jest.mocked(api.listVariables).mockResolvedValue({items});

    const {result} = await act(() => renderHook(() => useVariables('c1')));

    expect(collectionsApi.listCollections).toHaveBeenCalledTimes(1);
    expect(collectionsApi.listCollections).toHaveBeenCalledWith();
    expect(api.listVariables).toHaveBeenCalledWith({collectionId: 'c1'});

    expect(result.current.collections).toEqual(collections);
    expect(result.current.variables).toEqual(items);
    expect(result.current.errors).toBeUndefined();
  });

  it('sets errors when fetch fails', async () => {
    jest
      .mocked(collectionsApi.listCollections)
      .mockRejectedValue(new Error('unexpected'));
    jest.mocked(api.listVariables).mockResolvedValue({items: []});

    const {result} = await act(() => renderHook(() => useVariables()));

    expect(collectionsApi.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listVariables).toHaveBeenCalledTimes(1);

    expect(result.current.collections).toEqual([]);
    expect(result.current.variables).toEqual([]);
    expect(result.current.errors?.__ERROR__).toMatch(/unexpected/);
  });
});
