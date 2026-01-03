import {JobInput} from '../types';
import * as api from './http';

describe('jobs api', () => {
  afterEach(() => jest.mocked(global.fetch).mockClear());

  it('get jobs', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const result = await api.getJobs();

    expect(result).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: [],
    });
    expect(global.fetch).toHaveBeenCalledWith('/jobs?fields=status,errorRate', {
      method: 'GET',
    });
  });

  it('get jobs by collection id', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const result = await api.getJobs('123');

    expect(result).toEqual({
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

  it('get job', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () =>
        Promise.resolve({
          name: 'My Task #1',
          action: {
            type: 'HTTP',
            request: {uri: 'http://example.com'},
            retryPolicy: {retryCount: 5},
          },
        }),
    });

    const result = await api.getJob('123');

    expect(result).toEqual({
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
        retryPolicy: {deadline: '1m', retryCount: 5, retryInterval: '10s'},
      },
    });
    expect(global.fetch).toHaveBeenCalledWith('/jobs/123', {
      method: 'GET',
    });
  });

  it('get job (complement with default policy)', async () => {
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

    const result = await api.getJob('123');

    expect(result).toEqual({
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
        retryPolicy: {deadline: '1m', retryCount: 3, retryInterval: '10s'},
      },
    });
    expect(global.fetch).toHaveBeenCalledWith('/jobs/123', {
      method: 'GET',
    });
  });

  it('create job', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
    });

    await api.createJob({name: 'My Task'} as JobInput);

    expect(global.fetch).toHaveBeenCalledWith('/jobs', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: '{"name":"My Task"}',
    });
  });

  it('update job', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 204,
    });

    await api.updateJob({
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

  it('delete job', async () => {
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

  it('get job status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({running: false}),
    });

    const result = await api.getJobStatus('123');

    expect(result).toEqual({
      running: false,
      etag: '"2hhaswzbz72p8"',
    });
    expect(global.fetch).toHaveBeenCalledWith('/jobs/123/status', {
      method: 'GET',
    });
  });

  it('update job status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 204,
    });

    await api.updateJobStatus('123', {
      running: true,
      etag: '"2hhaswzbz72p8"',
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

  it('get job history', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const result = await api.getJobHistory('123');

    expect(result).toEqual({
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
