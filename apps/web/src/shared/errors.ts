export type Errors = Record<string, string>;

export class DomainError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(readonly details: Errors) {
    super('There are one or more field violations.', 400);
    this.name = 'ValidationError';
  }
}

export const toErrorMap = (error: unknown): Errors =>
  error instanceof ValidationError
    ? error.details
    : {
        __ERROR__:
          error instanceof DomainError
            ? `Oops! Code ${error.status}: ${error.message}`
            : 'Oops, something went wrong: ' +
              (error instanceof Error ? error.message : String(error)),
      };
