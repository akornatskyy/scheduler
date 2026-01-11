import {Rule} from 'check-compiler';

export const idRule: Rule<string> = {
  type: 'string',
  min: 3,
  max: 64,
  pattern: /^[A-Za-z0-9][A-Za-z0-9_-]*$/,
  messages: {'string pattern': 'Required to match URL safe characters only.'},
};

export const nameRule: Rule<string> = {type: 'string', min: 3, max: 64};
