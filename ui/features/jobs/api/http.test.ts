import {JobInput} from '../types';
import * as api from './http';

describe('jobs api', () => {
  afterEach(() => jest.mocked(global.fetch).mockClear());

  it('list', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const d = await api.listJobs();

    expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: [],
    });
    expect(global.fetch).toHaveBeenCalledWith('/jobs?fields=status,errorRate', {
      method: 'GET',
    });
  });

  it('list by collection id', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const d = await api.listJobs('123');

    expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: [],
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/jobs?fields=status,errorRate&collectionId=123',
      {
        method: 'GET',
      },
    );
  });

  it('retrieve', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () =>
        Promise.resolve({
          name: 'My Task #1',
          action: {
            type: 'HTTP',
            request: {
              uri: 'http://example.com',
            },
            retryPolicy: {
              retryCount: 5,
            },
          },
        }),
    });

    const d = await api.retrieveJob('123');

    expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      name: 'My Task #1',
      action: {
        type: 'HTTP',
        request: {
          uri: 'http://example.com',
          method: 'GET',
          headers: [],
          body: '',
        },
        retryPolicy: {
          deadline: '1m',
          retryCount: 5,
          retryInterval: '10s',
        },
      },
    });
    expect(global.fetch).toHaveBeenCalledWith('/jobs/123', {
      method: 'GET',
    });
  });

  it('retrieve (complement with default policy)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () =>
        Promise.resolve({
          name: 'My Task #1',
          action: {
            type: 'HTTP',
            request: {
              uri: 'http://example.com',
              method: 'HEAD',
            },
          },
        }),
    });

    const d = await api.retrieveJob('123');

    expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      name: 'My Task #1',
      action: {
        type: 'HTTP',
        request: {
          uri: 'http://example.com',
          method: 'HEAD',
          headers: [],
          body: '',
        },
        retryPolicy: {
          deadline: '1m',
          retryCount: 3,
          retryInterval: '10s',
        },
      },
    });
    expect(global.fetch).toHaveBeenCalledWith('/jobs/123', {
      method: 'GET',
    });
  });

  it('save (create)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
    });

    await api.saveJob({name: 'My Task'} as JobInput);

    expect(global.fetch).toHaveBeenCalledWith('/jobs', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: '{"name":"My Task"}',
    });
  });

  it('save (update)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 204,
    });

    await api.saveJob({
      id: '123',
      etag: '"2hhaswzbz72p8"',
      name: 'My Task',
    } as JobInput);

    expect(global.fetch).toHaveBeenCalledWith('/jobs/123', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'if-match': '"2hhaswzbz72p8"',
      },
      body: '{"name":"My Task"}',
    });
  });

  it('delete', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 204,
    });

    await api.deleteJob('123', '"2hhaswzbz72p8"');

    expect(global.fetch).toHaveBeenCalledWith('/jobs/123', {
      method: 'DELETE',
      headers: {
        'if-match': '"2hhaswzbz72p8"',
      },
    });
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
