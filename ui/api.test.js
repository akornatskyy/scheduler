import api from './api';

describe('api', () => {
  afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
  });

  describe('handles error: ', () => {
    it('unexpected', () => {
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
  });

  describe('collections', () => {
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

    it('retrieve', () => {
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

    it('save (post)', () => {
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

    it('save (patch)', () => {
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

    it('delete', () => {
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
  });

  describe('jobs', () => {
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

    it('retrieve', () => {
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

    it('retrieve (complement with default policy)', () => {
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

    it('save (post)', () => {
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

    it('save (patch)', () => {
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

    it('delete', () => {
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

  describe('variables', () => {
    it('list', () => {
      global.fetch = jest.fn(resolvePromise({
        status: 200,
        headers: {get: () => '"2hhaswzbz72p8"'},
        json: () => {
          return {then: (f) => f({items: []})};
        }
      }));

      api.listVariables().then((d) => expect(d).toEqual({
        etag: '"2hhaswzbz72p8"',
        items: []
      }));

      expect(global.fetch).toBeCalledWith('/variables', {
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

      api.listVariables('123').then((d) => expect(d).toEqual({
        etag: '"2hhaswzbz72p8"',
        items: []
      }));

      expect(global.fetch).toBeCalledWith('/variables?collectionId=123', {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
    });

    it('retrieve', () => {
      global.fetch = jest.fn(resolvePromise({
        status: 200,
        headers: {get: () => '"2hhaswzbz72p8"'},
        json: () => {
          return {then: (f) => f({name: 'My Var'})};
        }
      }));

      api.retrieveVariable('123').then((d) => expect(d).toEqual({
        etag: '"2hhaswzbz72p8"',
        name: 'My Var'
      }));

      expect(global.fetch).toBeCalledWith('/variables/123', {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
    });

    it('save (post)', () => {
      global.fetch = jest.fn(resolvePromise({
        status: 201
      }));

      api.saveVariable({
        name: 'My Var'
      }).then(() => {});

      expect(global.fetch).toBeCalledWith('/variables', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json'
        },
        body: '{"name":"My Var"}'
      });
    });

    it('save (patch)', () => {
      global.fetch = jest.fn(resolvePromise({
        status: 204
      }));

      api.saveVariable({
        id: '123',
        etag: '"2hhaswzbz72p8"',
        updated: '2019-08-29T13:29:36.976Z',
        name: 'My Var'
      }).then(() => {});

      expect(global.fetch).toBeCalledWith('/variables/123', {
        method: 'PATCH',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'If-Match': '"2hhaswzbz72p8"'
        },
        body: '{"name":"My Var"}'
      });
    });

    it('delete', () => {
      global.fetch = jest.fn(resolvePromise({
        status: 204
      }));

      api.deleteVariable('123', '"2hhaswzbz72p8"').then(() => {});

      expect(global.fetch).toBeCalledWith('/variables/123', {
        method: 'DELETE',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'If-Match': '"2hhaswzbz72p8"'
        }
      });
    });
  });
});
