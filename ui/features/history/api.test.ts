import * as api from './api';

describe('history api', () => {
  afterEach(() => jest.mocked(global.fetch).mockClear());

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
      });
    });

    it('patch', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 204,
      });

      await api.patchJobStatus('123', {
        etag: '"2hhaswzbz72p8"',
        running: true,
      });

      expect(global.fetch).toHaveBeenCalledWith('/jobs/123/status', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'if-match': '"2hhaswzbz72p8"',
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
          'if-match': '"2hhaswzbz72p8"',
        },
      });
    });
  });
});
