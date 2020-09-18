import {go} from './fetch';

describe('fetch go', () => {
  afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
  });

  describe('handles error: ', () => {
    it('unexpected', () => {
      global.fetch = jest.fn(rejectPromise({
        message: 'unexpected error'
      }));

      go('GET', '/').catch((e) => expect(e).toEqual({
        __ERROR__: 'unexpected error'
      }));

      expect(global.fetch).toBeCalledWith('/', {
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

      go('GET', '/').catch((e) => expect(e).toEqual({
        __ERROR__: '404: Not Found'
      }));

      expect(global.fetch).toBeCalledWith('/', {
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

      go('POST', '/').catch((e) => expect(e).toEqual({
        name: 'Required field cannot be left blank.'
      }));

      expect(global.fetch.mock.calls.length).toBe(1);
    });
  });
});
