import {nameRule} from '$shared/rules';
import {makeCheck} from '$shared/utils';
import type {CollectionInput} from './types';

export const checkCollectionInput = makeCheck<CollectionInput>({
  type: 'object',
  properties: {
    name: nameRule,
    state: {type: 'string', min: 7, max: 8, pattern: /^(enabled|disabled)$/},
  },
  required: ['name', 'state'],
});
