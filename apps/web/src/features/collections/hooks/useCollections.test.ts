import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import {useCollections} from './useCollections';

jest.mock('../api');

describe('useCollections', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates state with fetched items', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });

    const {result} = await act(async () => renderHook(() => useCollections()));

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(result.current.items).toEqual([
      {id: '65ada2f9', name: 'My App #1', state: 'enabled'},
    ]);
    expect(result.current.errors).toBeUndefined();
  });

  it('sets errors when listCollections fails', async () => {
    jest.mocked(api.listCollections).mockRejectedValue(new Error('unexpected'));

    const {result} = await act(async () => renderHook(() => useCollections()));

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(result.current.items).toEqual([]);
    expect(result.current.errors?.__ERROR__).toMatch(/unexpected/);
  });
});
