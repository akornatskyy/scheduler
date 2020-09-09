import api from './api';

describe('api', () => {
  afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
  });

  it('unexpected error', () => {
    global.fetch = jest.fn(rejectPromise({
      message: 'unexpected error'
    }));

    api.listCollections().catch((e) => expect(e).toEqual({
      __ERROR__: 'unexpected error'
    }));

    expect(global.fetch).toBeCalledWith('/collections', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
  });

  it('not found', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 404,
      statusText: 'Not Found'
    }));

    api.retrieveCollection('123').catch((e) => expect(e).toEqual({
      __ERROR__: '404: Not Found'
    }));

    expect(global.fetch).toBeCalledWith('/collections/123', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
  });

  it('bad request', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 400,
      json: () => {
        return {then: (f) => f({errors: [
          {
            type: 'other'
          },
          {
            type: 'field',
            location: 'name',
            message: 'Required field cannot be left blank.'
          }
        ]})};
      }
    }));

    api.saveCollection({}).catch((e) => expect(e).toEqual({
      name: 'Required field cannot be left blank.'
    }));

    expect(global.fetch.mock.calls.length).toBe(1);
  });

  it('list collections', () => {
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

  it('retrieve collection', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => {
        return {then: (f) => f({name: 'My App #1'})};
      }
    }));

    api.retrieveCollection('123').then((d) => expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      name: 'My App #1'
    }));

    expect(global.fetch).toBeCalledWith('/collections/123', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
  });

  it('save collection (post)', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 201
    }));

    api.saveCollection({
      name: 'My App'
    }).then(() => {});

    expect(global.fetch).toBeCalledWith('/collections', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      body: '{"name":"My App"}'
    });
  });

  it('save collection (patch)', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 204
    }));

    api.saveCollection({
      id: '123',
      etag: '"2hhaswzbz72p8"',
      updated: '2019-08-29T13:29:36.976Z',
      name: 'My App'
    }).then(() => {});

    expect(global.fetch).toBeCalledWith('/collections/123', {
      method: 'PATCH',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'If-Match': '"2hhaswzbz72p8"'
      },
      body: '{"name":"My App"}'
    });
  });

  it('delete collection', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 204
    }));

    api.deleteCollection('123', '"2hhaswzbz72p8"').then(() => {});

    expect(global.fetch).toBeCalledWith('/collections/123', {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'If-Match': '"2hhaswzbz72p8"'
      }
    });
  });

  it('list jobs', () => {
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

  it('retrieve job', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => {
        return {then: (f) => f({
          name: 'My Task #1',
          action: {
            type: 'HTTP',
            request: {
              uri: 'http://example.com',
            },
            retryPolicy: {
              retryCount: 5
            }
          }
        })};
      }
    }));

    api.retrieveJob('123').then((d) => expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      name: 'My Task #1',
      action: {
        type: 'HTTP',
        request: {
          uri: 'http://example.com',
          method: 'GET',
          headers: [],
          body: ''
        },
        retryPolicy: {
          deadline: '1m',
          retryCount: 5,
          retryInterval: '10s'
        }
      }
    }));

    expect(global.fetch).toBeCalledWith('/jobs/123', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
  });

  it('retrieve job (complement with default policy)', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => {
        return {then: (f) => f({
          name: 'My Task #1',
          action: {
            type: 'HTTP',
            request: {
              uri: 'http://example.com',
              method: 'HEAD'
            }
          }
        })};
      }
    }));

    api.retrieveJob('123').then((d) => expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      name: 'My Task #1',
      action: {
        type: 'HTTP',
        request: {
          uri: 'http://example.com',
          method: 'HEAD',
          headers: [],
          body: ''
        },
        retryPolicy: {
          deadline: '1m',
          retryCount: 3,
          retryInterval: '10s'
        }
      }
    }));

    expect(global.fetch).toBeCalledWith('/jobs/123', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
  });

  it('save job (post)', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 201
    }));

    api.saveJob({
      name: 'My Task'
    }).then(() => {});

    expect(global.fetch).toBeCalledWith('/jobs', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      body: '{"name":"My Task"}'
    });
  });

  it('save job (patch)', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 204
    }));

    api.saveJob({
      id: '123',
      etag: '"2hhaswzbz72p8"',
      updated: '2019-08-29T13:29:36.976Z',
      name: 'My Task'
    }).then(() => {});

    expect(global.fetch).toBeCalledWith('/jobs/123', {
      method: 'PATCH',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'If-Match': '"2hhaswzbz72p8"'
      },
      body: '{"name":"My Task"}'
    });
  });

  it('delete job', () => {
    global.fetch = jest.fn(resolvePromise({
      status: 204
    }));

    api.deleteJob('123', '"2hhaswzbz72p8"').then(() => {});

    expect(global.fetch).toBeCalledWith('/jobs/123', {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'If-Match': '"2hhaswzbz72p8"'
      }
    });
  });

  it('retrieve job status', () => {
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

  it('patch job status', () => {
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
