import {Variable} from './types';
import * as api from './variable-api';

describe('variable api', () => {
  afterEach(() => jest.mocked(global.fetch).mockClear());

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
    });
  });

  it('save (create)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
    });

    await api.saveVariable({name: 'My Var'} as Variable);

    expect(global.fetch).toHaveBeenCalledWith('/variables', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
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
      name: 'My Var',
    } as Variable);

    expect(global.fetch).toHaveBeenCalledWith('/variables/123', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'if-match': '"2hhaswzbz72p8"',
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
        'if-match': '"2hhaswzbz72p8"',
      },
    });
  });
});
