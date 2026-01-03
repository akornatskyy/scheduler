import {Variable} from '../types';
import * as api from './http';

describe('variables api', () => {
  afterEach(() => jest.mocked(global.fetch).mockClear());

  it('get variables', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const result = await api.getVariables();

    expect(result).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: [],
    });
    expect(global.fetch).toHaveBeenCalledWith('/variables', {
      method: 'GET',
    });
  });

  it('get variables by collection id', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const result = await api.getVariables('123');

    expect(result).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: [],
    });
    expect(global.fetch).toHaveBeenCalledWith('/variables?collectionId=123', {
      method: 'GET',
    });
  });

  it('get variable', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({name: 'My Var'}),
    });

    const result = await api.getVariable('123');

    expect(result).toEqual({
      etag: '"2hhaswzbz72p8"',
      name: 'My Var',
    });
    expect(global.fetch).toHaveBeenCalledWith('/variables/123', {
      method: 'GET',
    });
  });

  it('create variable', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
    });

    await api.createVariable({name: 'My Var'} as Variable);

    expect(global.fetch).toHaveBeenCalledWith('/variables', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: '{"name":"My Var"}',
    });
  });

  it('update variable', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 204,
    });

    await api.updateVariable({
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

  it('delete variable', async () => {
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
