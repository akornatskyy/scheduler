import {idRule, nameRule} from '$shared/rules';
import {makeCheck} from '$shared/utils';
import {VariableInput} from './types';

export const checkVariableInput = makeCheck<VariableInput>({
  type: 'object',
  properties: {
    name: nameRule,
    collectionId: idRule,
    value: {type: 'string', max: 1024},
  },
  required: ['name', 'collectionId'],
});
