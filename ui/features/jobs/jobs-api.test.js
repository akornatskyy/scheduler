import * as api from './jobs-api';

describe('jobs api', () => {
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

    api.listJobs().then((d) => expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: []
    }));

    expect(global.fetch).toBeCalledWith('/jobs?fields=status,errorRate', {
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

    api.listJobs('123').then((d) => expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: []
    }));

    expect(global.fetch)
        .toBeCalledWith('/jobs?fields=status,errorRate&collectionId=123', {
          method: 'GET',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        });
  });
});
