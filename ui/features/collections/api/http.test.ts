import * as api from './http';

describe('collections api', () => {
  afterEach(() => jest.mocked(global.fetch).mockClear());

  it('list', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const d = await api.listCollections();

    expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: [],
    });
    expect(global.fetch).toHaveBeenCalledWith('/collections', {
      method: 'GET',
    });
  });

  it('retrieve', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({name: 'My App #1'}),
    });

    const d = await api.retrieveCollection('123');

    expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      name: 'My App #1',
    });
    expect(global.fetch).toHaveBeenCalledWith('/collections/123', {
      method: 'GET',
    });
  });

  it('save (create)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
    });

    await api.saveCollection({
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

  it('save (update)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 204,
    });

    await api.saveCollection({
      id: '123',
      etag: '"2hhaswzbz72p8"',
      name: 'My App',
      state: 'enabled',
      updated: '2019-08-29T13:29:36.976Z',
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

  it('delete', async () => {
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
