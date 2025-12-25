import {DomainError, ValidationError} from '../errors';
import {go} from './fetch';

describe('fetch go', () => {
  afterEach(() => jest.mocked(global.fetch).mockClear());

  describe('handles success: ', () => {
    it('200 returns parsed json', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({foo: 'bar'}),
        headers: {
          get: () => null,
        },
      });

      await expect(go<{foo: string}>('GET', '/')).resolves.toEqual({
        foo: 'bar',
      });

      expect(global.fetch).toHaveBeenCalledWith('/', {method: 'GET'});
    });

    it('200 adds etag to object response when header exists', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({foo: 'bar'}),
        headers: {
          get: (key: string) => (key === 'etag' ? 'W/"123"' : null),
        },
      });

      await expect(
        go<{foo: string; etag: string}>('GET', '/'),
      ).resolves.toEqual({
        foo: 'bar',
        etag: 'W/"123"',
      });

      expect(global.fetch).toHaveBeenCalledWith('/', {method: 'GET'});
    });

    it('201 returns void', async () => {
      global.fetch = jest.fn().mockResolvedValue({status: 201});

      await expect(go('POST', '/', {})).resolves.toBeUndefined();
    });

    it('204 returns void', async () => {
      global.fetch = jest.fn().mockResolvedValue({status: 204});

      await expect(go('DELETE', '/')).resolves.toBeUndefined();
    });
  });

  describe('builds request options: ', () => {
    it('POST includes json content-type and serialized body', async () => {
      global.fetch = jest.fn().mockResolvedValue({status: 204});

      await go('POST', '/', {a: 1});

      expect(global.fetch).toHaveBeenCalledWith('/', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({a: 1}),
      });
    });

    it('PATCH strips id/updated, sets `if-match from etag', async () => {
      global.fetch = jest.fn().mockResolvedValue({status: 204});

      await go('PATCH', '/', {id: 1, updated: 'x', etag: 'W/"123"', a: 1});

      expect(global.fetch).toHaveBeenCalledWith('/', {
        method: 'PATCH',
        headers: {'content-type': 'application/json', 'if-match': 'W/"123"'},
        body: JSON.stringify({a: 1}),
      });
    });

    it('PATCH without etag', async () => {
      global.fetch = jest.fn().mockResolvedValue({status: 204});

      await go('PATCH', '/', {id: '1', updated: 'x', a: 1});

      expect(global.fetch).toHaveBeenCalledWith('/', {
        method: 'PATCH',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({a: 1}),
      });
    });

    it('DELETE sets if-match when etag passed', async () => {
      global.fetch = jest.fn().mockResolvedValue({status: 204});

      await go('DELETE', '/', 'W/"123"');

      expect(global.fetch).toHaveBeenCalledWith('/', {
        method: 'DELETE',
        headers: {'if-match': 'W/"123"'},
      });
    });

    it('DELETE without etag', async () => {
      global.fetch = jest.fn().mockResolvedValue({status: 204});

      await go('DELETE', '/');

      expect(global.fetch).toHaveBeenCalledWith('/', {
        method: 'DELETE',
      });
    });
  });

  describe('handles error: ', () => {
    it('unexpected', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('unexpected error'));

      await expect(() => go('GET', '/')).rejects.toThrow(/unexpected/);

      expect(global.fetch).toHaveBeenCalledWith('/', {method: 'GET'});
    });

    it('not found', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
      });

      await expect(() => go('GET', '/')).rejects.toThrow(
        new DomainError('Not Found', 404),
      );

      expect(global.fetch).toHaveBeenCalledWith('/', {method: 'GET'});
    });

    it('bad request', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 400,
        json: () =>
          Promise.resolve({
            errors: [
              {
                type: 'field',
                location: 'name',
                message: 'Required field cannot be left blank.',
              },
              {
                type: 'field',
                location: 'value',
                message: 'Required to be a minimum of 3 characters in length.',
              },
            ],
          }),
      });

      await expect(() => go('POST', '/', {})).rejects.toThrow(
        new ValidationError({
          name: 'Required field cannot be left blank.',
          value: 'Required to be a minimum of 3 characters in length.',
        }),
      );

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('other type takes priority over field error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 400,
        json: () =>
          Promise.resolve({
            errors: [
              {
                type: 'other',
                message: 'Unexpected',
              },
              {
                type: 'field',
                location: 'name',
                message: 'Required field cannot be left blank.',
              },
            ],
          }),
      });

      await expect(() => go('POST', '/', {})).rejects.toThrow(
        new DomainError('Unexpected', 400),
      );

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
