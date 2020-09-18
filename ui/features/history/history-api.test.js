import * as api from './history-api';

describe('history api', () => {
  afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
  });

  describe('job status', () => {
    it('retrieve', () => {
      global.fetch = jest.fn(resolvePromise({
        status: 200,
        headers: {get: () => '"2hhaswzbz72p8"'},
        json: () => {
          return {then: (f) => f({
            running: false
          })};
        }
      }));

      api.retrieveJobStatus('123').then((d) => expect(d).toEqual({
        etag: '"2hhaswzbz72p8"',
        running: false
      }));

      expect(global.fetch).toBeCalledWith('/jobs/123/status', {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
    });

    it('patch', () => {
      global.fetch = jest.fn(resolvePromise({
        status: 204
      }));

      api.patchJobStatus('123', {
        id: '1234',
        etag: '"2hhaswzbz72p8"',
        updated: '2019-08-29T13:29:36.976Z',
        running: true
      }).then(() => {});

      expect(global.fetch).toBeCalledWith('/jobs/123/status', {
        method: 'PATCH',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'If-Match': '"2hhaswzbz72p8"'
        },
        body: '{"running":true}'
      });
    });
  });

  describe('job history', () => {
    it('list job history', () => {
      global.fetch = jest.fn(resolvePromise({
        status: 200,
        headers: {get: () => '"2hhaswzbz72p8"'},
        json: () => {
          return {then: (f) => f({
            items: []
          })};
        }
      }));

      api.listJobHistory('123').then((d) => expect(d).toEqual({
        etag: '"2hhaswzbz72p8"',
        items: []
      }));

      expect(global.fetch).toBeCalledWith('/jobs/123/history', {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
    });

    it('delete job history', () => {
      global.fetch = jest.fn(resolvePromise({
        status: 204
      }));

      api.deleteJobHistory('123', '"2hhaswzbz72p8"').then(() => {});

      expect(global.fetch).toBeCalledWith('/jobs/123/history', {
        method: 'DELETE',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'If-Match': '"2hhaswzbz72p8"'
        }
      });
    });
  });
});
