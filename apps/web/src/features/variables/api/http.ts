import {go} from '$shared/api';
import {Variable, VariableInput, VariableItem} from '../types';

type GetVariablesResponse = {
  items: VariableItem[];
};

export const getVariables = (
  collectionId?: string | null,
): Promise<GetVariablesResponse> =>
  go(
    'GET',
    collectionId ? `/variables?collectionId=${collectionId}` : '/variables',
  );

export const getVariable = (id: string): Promise<Variable> =>
  go('GET', `/variables/${id}`);

export const createVariable = (v: VariableInput): Promise<void> =>
  go('POST', '/variables', v);

export const updateVariable = (v: VariableInput): Promise<void> =>
  go('PATCH', `/variables/${v.id}`, v);

export const deleteVariable = (id: string, etag?: string): Promise<void> =>
  go('DELETE', `/variables/${id}`, etag);
