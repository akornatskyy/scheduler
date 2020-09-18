import * as api from './collections-api';

describe('collections api', () => {
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

    api.listCollections().then((d) => expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: []
    }));

    expect(global.fetch).toBeCalledWith('/collections', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
  });
});
