import type {Errors} from '$shared/errors';
import {compile, type Rule, type Violation} from 'check-compiler';
import {deepEqual} from './diff';

export function makeCheck<T>(rule: Rule<T>) {
  const check = compile<T>(rule);

  return (
    input: T,
    setErrors: (fn: (prevState: Errors) => Errors) => void,
  ): boolean => {
    const violations: Violation[] = [];
    check(input, violations);

    const errors = toErrors(violations);

    setErrors((prevState) =>
      deepEqual(prevState, errors) ? prevState : errors,
    );

    return violations.length === 0;
  };
}

export function toErrors(violations: Violation[]): Errors {
  const errors: Errors = {};
  for (const {location, message} of violations) {
    if (location) errors[location] = message;
  }

  return errors;
}
