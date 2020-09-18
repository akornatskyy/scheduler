import * as api from './collection-api';

describe('collection api', () => {
  afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
  });

  it('retrieve', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => {
        return {then: (f) => f({name: 'My App #1'})};
      }
    }));

    api.retrieveCollection('123').then((d) => expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      name: 'My App #1'
    }));

    expect(global.fetch).toBeCalledWith('/collections/123', {
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

    api.saveCollection({
      name: 'My App'
    }).then(() => {});

    expect(global.fetch).toBeCalledWith('/collections', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      body: '{"name":"My App"}'
    });
  });

  it('save (update)', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 204
    }));

    api.saveCollection({
      id: '123',
      etag: '"2hhaswzbz72p8"',
      updated: '2019-08-29T13:29:36.976Z',
      name: 'My App'
    }).then(() => {});

    expect(global.fetch).toBeCalledWith('/collections/123', {
      method: 'PATCH',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'If-Match': '"2hhaswzbz72p8"'
      },
      body: '{"name":"My App"}'
    });
  });

  it('delete', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 204
    }));

    api.deleteCollection('123', '"2hhaswzbz72p8"').then(() => {});

    expect(global.fetch).toBeCalledWith('/collections/123', {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'If-Match': '"2hhaswzbz72p8"'
      }
    });
  });
});
