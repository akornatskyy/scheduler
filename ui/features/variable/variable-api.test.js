import * as api from './variable-api';

describe('variable api', () => {
  afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
  });

  it('retrieve', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => {
        return {then: (f) => f({name: 'My Var'})};
      }
    }));

    api.retrieveVariable('123').then((d) => expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      name: 'My Var'
    }));

    expect(global.fetch).toBeCalledWith('/variables/123', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
  });

  it('save (create)', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 201
    }));

    api.saveVariable({
      name: 'My Var'
    }).then(() => {});

    expect(global.fetch).toBeCalledWith('/variables', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      body: '{"name":"My Var"}'
    });
  });

  it('save (update)', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 204
    }));

    api.saveVariable({
      id: '123',
      etag: '"2hhaswzbz72p8"',
      updated: '2019-08-29T13:29:36.976Z',
      name: 'My Var'
    }).then(() => {});

    expect(global.fetch).toBeCalledWith('/variables/123', {
      method: 'PATCH',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'If-Match': '"2hhaswzbz72p8"'
      },
      body: '{"name":"My Var"}'
    });
  });

  it('delete', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 204
    }));

    api.deleteVariable('123', '"2hhaswzbz72p8"').then(() => {});

    expect(global.fetch).toBeCalledWith('/variables/123', {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'If-Match': '"2hhaswzbz72p8"'
      }
    });
  });
});
