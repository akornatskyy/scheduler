import * as api from './job-api';
import {JobInput} from './types';

describe('job api', () => {
  afterEach(() => jest.mocked(global.fetch).mockClear());

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
});
