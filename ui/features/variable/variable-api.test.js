import * as api from './variable-api';

describe('variable api', () => {
  afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
  });

  it('retrieve', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({name: 'My Var'}),
    });

    const d = await api.retrieveVariable('123');

    expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      name: 'My Var',
    });
    expect(global.fetch).toHaveBeenCalledWith('/variables/123', {
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

    await api.saveVariable({
      name: 'My Var',
    });

    expect(global.fetch).toHaveBeenCalledWith('/variables', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
      },
      body: '{"name":"My Var"}',
    });
  });

  it('save (update)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 204,
    });

    await api.saveVariable({
      id: '123',
      etag: '"2hhaswzbz72p8"',
      updated: '2019-08-29T13:29:36.976Z',
      name: 'My Var',
    });

    expect(global.fetch).toHaveBeenCalledWith('/variables/123', {
      method: 'PATCH',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'If-Match': '"2hhaswzbz72p8"',
      },
      body: '{"name":"My Var"}',
    });
  });

  it('delete', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 204,
    });

    await api.deleteVariable('123', '"2hhaswzbz72p8"');

    expect(global.fetch).toHaveBeenCalledWith('/variables/123', {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'If-Match': '"2hhaswzbz72p8"',
      },
    });
  });
});
