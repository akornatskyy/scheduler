import {
  client,
  type GetResourceResponse,
  type ListResourceResponse,
} from '$shared/api';
import type {Collection, CollectionInput, CollectionItem} from '../types';
import * as api from './http';

jest.mock('$shared/api');

describe('collections api', () => {
  const item = {id: '123'} as Collection;

  beforeEach(() => jest.clearAllMocks());

  it('listCollections() calls client.list with /collections', async () => {
    const payload: ListResourceResponse<CollectionItem> = {
      items: [item],
    };
    jest.mocked(client).list.mockResolvedValue(payload);

    const result = await api.listCollections();

    expect(result).toBe(payload);
    expect(client.list).toHaveBeenCalledWith('/collections');
  });

  it('getCollection() calls client.get with /collections/:id', async () => {
    const payload: GetResourceResponse<Collection> = [item, 'W/"1"'];
    jest.mocked(client).get.mockResolvedValue(payload);

    const result = await api.getCollection('c1');

    expect(result).toBe(payload);
    expect(client.get).toHaveBeenCalledWith('/collections/c1');
  });

  it('createCollection() calls client.post with /collections', async () => {
    jest.mocked(client).post.mockResolvedValue('new-id');

    const id = await api.createCollection(item);

    expect(id).toBe('new-id');
    expect(client.post).toHaveBeenCalledWith('/collections', item);
  });

  it('updateCollection() calls client.patch with /collections/:id', async () => {
    const input: Partial<CollectionInput> = {name: 'New Name'};

    await api.updateCollection('c1', input, 'W/"1"');

    expect(client.patch).toHaveBeenCalledWith(
      '/collections/c1',
      input,
      'W/"1"',
    );
  });

  it('deleteCollection() calls client.delete with /collections/:id', async () => {
    await api.deleteCollection('c1', 'W/"2"');

    expect(client.delete).toHaveBeenCalledWith('/collections/c1', 'W/"2"');
  });
});
