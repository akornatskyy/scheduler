import {DomainError, toErrorMap, ValidationError} from './errors';

describe('ui/shared/errors', () => {
  describe('DomainError', () => {
    it('preserves message, status and sets name', () => {
      const error = new DomainError('Not found', 404);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Not found');
      expect(error.status).toBe(404);
      expect(error.name).toBe('DomainError');
    });
  });

  describe('ValidationError', () => {
    it('sets status=400, name and stores details', () => {
      const details = {field: 'Required'};
      const error = new ValidationError(details);

      expect(error).toBeInstanceOf(DomainError);
      expect(error.status).toBe(400);
      expect(error.name).toBe('ValidationError');
      expect(error.details).toEqual(details);
      expect(error.message).toBe('There are one or more field violations.');
    });
  });

  describe('toErrorMap', () => {
    it('returns details for ValidationError', () => {
      const details = {email: 'Invalid email'};

      expect(toErrorMap(new ValidationError(details))).toEqual(details);
    });

    it('maps DomainError to __ERROR__ message with code', () => {
      const error = new DomainError('Boom', 418);

      expect(toErrorMap(error)).toEqual({
        __ERROR__: 'Oops! Code 418: Boom',
      });
    });

    it('maps native Error to __ERROR__ message with error.message', () => {
      expect(toErrorMap(new Error('Nope'))).toEqual({
        __ERROR__: 'Oops, something went wrong: Nope',
      });
    });

    it('maps non-Error values to __ERROR__ message using String(value)', () => {
      expect(toErrorMap('bad')).toEqual({
        __ERROR__: 'Oops, something went wrong: bad',
      });
      expect(toErrorMap(123)).toEqual({
        __ERROR__: 'Oops, something went wrong: 123',
      });
    });
  });
});
