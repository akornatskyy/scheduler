import * as api from './history-api';

describe('history api', () => {
  afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
  });

  describe('job status', () => {
    it('retrieve', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        headers: {get: () => '"2hhaswzbz72p8"'},
        json: () => Promise.resolve({running: false}),
      });

      const d = await api.retrieveJobStatus('123');

      expect(d).toEqual({
        etag: '"2hhaswzbz72p8"',
        running: false,
      });
      expect(global.fetch).toHaveBeenCalledWith('/jobs/123/status', {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    });

    it('patch', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 204,
      });

      await api.patchJobStatus('123', {
        id: '1234',
        etag: '"2hhaswzbz72p8"',
        updated: '2019-08-29T13:29:36.976Z',
        running: true,
      });

      expect(global.fetch).toHaveBeenCalledWith('/jobs/123/status', {
        method: 'PATCH',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'If-Match': '"2hhaswzbz72p8"',
        },
        body: '{"running":true}',
      });
    });
  });

  describe('job history', () => {
    it('list job history', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        headers: {get: () => '"2hhaswzbz72p8"'},
        json: () => Promise.resolve({items: []}),
      });

      const d = await api.listJobHistory('123');

      expect(d).toEqual({
        etag: '"2hhaswzbz72p8"',
        items: [],
      });
      expect(global.fetch).toHaveBeenCalledWith('/jobs/123/history', {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    });

    it('delete job history', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 204,
      });

      await api.deleteJobHistory('123', '"2hhaswzbz72p8"');

      expect(global.fetch).toHaveBeenCalledWith('/jobs/123/history', {
        method: 'DELETE',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'If-Match': '"2hhaswzbz72p8"',
        },
      });
    });
  });
});
