import {DomainError, ValidationError} from '$shared/errors';

export async function createErrorFromResponse(
  response: Response,
): Promise<Error> {
  const status = response.status;
  const type = response.headers.get('content-type');
  if (type) {
    const message = await response.text();
    if (type.startsWith('application/json')) {
      const parsed = JSON.parse(message);
      if (isValidationErrorResponse(parsed)) {
        const details: Record<string, string> = {};
        for (const error of parsed.errors) {
          if (error.type === 'field') {
            details[error.location] = error.message;
          } else {
            return new DomainError(error.message, status);
          }
        }

        return new ValidationError(details);
      }

      if (isDomainErrorResponse(parsed)) {
        return new DomainError(parsed.message, status);
      }
    } else if (type.startsWith('text/plain') && message) {
      return new DomainError(message, status);
    }
  }

  return new DomainError(HttpErrorMap[status] ?? response.statusText, status);
}

const HttpErrorMap: Record<number, string> = {
  404: 'The requested resource could not be found on the server.',
  503: 'The server is currently overloaded or undergoing maintenance.',
};

function isDomainErrorResponse(value: unknown): value is DomainErrorResponse {
  return (
    value !== null &&
    typeof value === 'object' &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

function isValidationErrorResponse(
  value: unknown,
): value is ValidationErrorResponse {
  if (value === null || typeof value !== 'object') return false;
  const {errors} = value as {errors: unknown};
  return Array.isArray(errors) && errors.every(isViolation);
}

function isViolation(value: unknown): value is Violation {
  if (typeof value !== 'object' || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.type === 'string' &&
    typeof e.location === 'string' &&
    typeof e.message === 'string'
  );
}

type DomainErrorResponse = {message: string};
type ValidationErrorResponse = {errors: Violation[]};
type Violation = {type: string; location: string; message: string};
