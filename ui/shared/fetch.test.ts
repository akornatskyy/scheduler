import {go} from './fetch';

describe('fetch go', () => {
  afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
  });

  describe('handles error: ', () => {
    it('unexpected', async () => {
      global.fetch = jest.fn().mockRejectedValue({
        message: 'unexpected error',
      });

      await go('GET', '/').catch((e) =>
        expect(e).toEqual({
          __ERROR__: 'unexpected error',
        }),
      );

      expect(global.fetch).toHaveBeenCalledWith('/', {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    });

    it('not found', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
      });

      await go('GET', '/').catch((e) =>
        expect(e).toEqual({
          __ERROR__: '404: Not Found',
        }),
      );

      expect(global.fetch).toHaveBeenCalledWith('/', {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    });

    it('bad request', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 400,
        json: () => {
          return {
            then: (f) =>
              f({
                errors: [
                  {
                    type: 'other',
                  },
                  {
                    type: 'field',
                    location: 'name',
                    message: 'Required field cannot be left blank.',
                  },
                ],
              }),
          };
        },
      });

      await go('POST', '/').catch((e) =>
        expect(e).toEqual({
          name: 'Required field cannot be left blank.',
        }),
      );

      expect(global.fetch.mock.calls.length).toBe(1);
    });
  });
});
