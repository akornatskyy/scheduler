import type {Errors} from '$shared/errors';
import {idRule, nameRule} from '$shared/rules';
import {deepEqual, toErrors} from '$shared/utils';
import {compile, type Rule, type Violation} from 'check-compiler';
import type {
  Action,
  HttpRequest,
  HttpRequestHeader,
  JobInput,
  RetryPolicy,
} from './types';

const httpRequestHeaderRule: Rule<HttpRequestHeader> = {
  type: 'object',
  properties: {
    name: {type: 'string', min: 5, max: 32},
    value: {type: 'string', min: 1, max: 256},
  },
  required: ['name', 'value'],
};

const requestRule: Rule<HttpRequest> = {
  type: 'object',
  properties: {
    method: {
      type: 'string',
      min: 3,
      max: 6,
      pattern: /^(HEAD|GET|POST|PUT|PATCH|DELETE)$/,
      messages: {'string pattern': 'Must be a valid HTTP verb.'},
    },
    uri: {type: 'string', min: 8, max: 256},
    headers: {type: 'array', items: httpRequestHeaderRule, max: 10},
    body: {type: 'string', max: 1024},
  },
  required: ['method', 'uri', 'headers', 'body'],
};

const durationRule: Rule<string> = {
  type: 'string',
  min: 2,
  max: 31,
  pattern: /^((\d+(\.\d+)?|\.\d+)(s|m|h))+$/,
  messages: {
    'string pattern': 'Invalid duration format.',
  },
};

const retryPolicyRule: Rule<RetryPolicy> = {
  type: 'object',
  properties: {
    deadline: durationRule,
    retryCount: {type: 'integer', min: 0, max: 10},
    retryInterval: durationRule,
  },
  required: ['deadline', 'retryCount', 'retryInterval'],
};

const actionRule: Rule<Omit<Action, 'request' | 'retryPolicy'>> = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      min: 4,
      max: 4,
      pattern: /^HTTP$/,
      messages: {'string pattern': "Must be 'HTTP' only."},
    },
  },
  required: ['type'],
};

const jobInputRule: Rule<Omit<JobInput, 'action'>> = {
  type: 'object',
  properties: {
    name: nameRule,
    collectionId: idRule,
    state: {type: 'string', min: 7, max: 8, pattern: /^(enabled|disabled)$/},
    schedule: {type: 'string', min: 6, max: 64},
  },
  required: ['name', 'collectionId', 'state', 'schedule'],
};

export const checkJobInput = (() => {
  // This check matches flat error locations from server,
  // e.g. deadline vs action.retryPolicy.deadline

  const checkRequest = compile(requestRule);
  const checkRetryPolicy = compile(retryPolicyRule);
  const checkAction = compile(actionRule);
  const checkJobInput = compile(jobInputRule);

  return (
    input: JobInput,
    setErrors: (fn: (prevState: Errors) => Errors) => void,
  ): boolean => {
    const violations: Violation[] = [];

    checkRequest(input.action.request, violations);
    checkRetryPolicy(input.action.retryPolicy, violations);
    checkAction(input.action, violations);
    checkJobInput(input, violations);

    const errors = toErrors(violations);

    setErrors((prevState) =>
      deepEqual(prevState, errors) ? prevState : errors,
    );

    return violations.length === 0;
  };
})();
