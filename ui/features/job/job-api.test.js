import * as api from './job-api';

describe('job api', () => {
  afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
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
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
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
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
  });

  it('save (post)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
    });

    await api.saveJob({
      name: 'My Task',
    });

    expect(global.fetch).toHaveBeenCalledWith('/jobs', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
      },
      body: '{"name":"My Task"}',
    });
  });

  it('save (patch)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 204,
    });

    await api.saveJob({
      id: '123',
      etag: '"2hhaswzbz72p8"',
      updated: '2019-08-29T13:29:36.976Z',
      name: 'My Task',
    });

    expect(global.fetch).toHaveBeenCalledWith('/jobs/123', {
      method: 'PATCH',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'If-Match': '"2hhaswzbz72p8"',
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
        'X-Requested-With': 'XMLHttpRequest',
        'If-Match': '"2hhaswzbz72p8"',
      },
    });
  });
});
