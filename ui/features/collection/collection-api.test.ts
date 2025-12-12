import * as api from './collection-api';

describe('collection api', () => {
  afterEach(() => {
    (global.fetch as jest.Mock).mockClear();
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
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
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
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
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
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'If-Match': '"2hhaswzbz72p8"',
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
        'X-Requested-With': 'XMLHttpRequest',
        'If-Match': '"2hhaswzbz72p8"',
      },
    });
  });
});
