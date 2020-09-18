import * as api from './variables-api';

describe('variables api', () => {
  afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
  });

  it('list', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => {
        return {then: (f) => f({items: []})};
      }
    }));

    api.listVariables().then((d) => expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: []
    }));

    expect(global.fetch).toBeCalledWith('/variables', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
  });

  it('list by collection id', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => {
        return {then: (f) => f({items: []})};
      }
    }));

    api.listVariables('123').then((d) => expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: []
    }));

    expect(global.fetch).toBeCalledWith('/variables?collectionId=123', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
  });
});
