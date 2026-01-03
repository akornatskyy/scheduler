import * as api from './http';

describe('collections api', () => {
  afterEach(() => jest.mocked(global.fetch).mockClear());

  it('get collections', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const result = await api.getCollections();

    expect(result).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: [],
    });
    expect(global.fetch).toHaveBeenCalledWith('/collections', {
      method: 'GET',
    });
  });

  it('get collection', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({name: 'My App #1'}),
    });

    const result = await api.getCollection('123');

    expect(result).toEqual({
      etag: '"2hhaswzbz72p8"',
      name: 'My App #1',
    });
    expect(global.fetch).toHaveBeenCalledWith('/collections/123', {
      method: 'GET',
    });
  });

  it('create collection', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
    });

    await api.createCollection({
      name: 'My App',
      state: 'enabled',
    });

    expect(global.fetch).toHaveBeenCalledWith('/collections', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: '{"name":"My App","state":"enabled"}',
    });
  });

  it('update collection', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 204,
    });

    await api.updateCollection({
      id: '123',
      name: 'My App',
      state: 'enabled',
      etag: '"2hhaswzbz72p8"',
    });

    expect(global.fetch).toHaveBeenCalledWith('/collections/123', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'if-match': '"2hhaswzbz72p8"',
      },
      body: '{"name":"My App","state":"enabled"}',
    });
  });

  it('delete collection', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 204,
    });

    await api.deleteCollection('123', '"2hhaswzbz72p8"');

    expect(global.fetch).toHaveBeenCalledWith('/collections/123', {
      method: 'DELETE',
      headers: {
        'if-match': '"2hhaswzbz72p8"',
      },
    });
  });
});
