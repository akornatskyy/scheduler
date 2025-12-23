import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import {useVariables} from './useVariables';

jest.mock('../api');

describe('useVariables', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads collections and variables for given collectionId', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App', state: 'enabled'}],
    });
    jest.mocked(api.listVariables).mockResolvedValue({
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

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(api.listVariables).toHaveBeenCalledTimes(1);
    expect(api.listVariables).toHaveBeenCalledWith('65ada2f9');

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
    jest.mocked(api.listCollections).mockRejectedValue(new Error('Unexpected'));
    jest.mocked(api.listVariables).mockResolvedValue({items: []});

    const {result} = await act(() => renderHook(() => useVariables()));

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listVariables).toHaveBeenCalledTimes(1);

    expect(result.current.collections).toEqual([]);
    expect(result.current.variables).toEqual([]);
    expect(result.current.errors?.__ERROR__).toMatch(/Unexpected/);
  });
});
