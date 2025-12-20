import {api} from '$features/collections';
import {go} from '$shared/fetch';
import {Variable, VariableItem} from '../types';

export const listCollections = api.listCollections;

type ListVariablesResponse = {
  items: VariableItem[];
  etag?: string | null;
};

export const listVariables = (
  collectionId?: string | null,
): Promise<ListVariablesResponse> =>
  go(
    'GET',
    collectionId ? `/variables?collectionId=${collectionId}` : '/variables',
  );

export const retrieveVariable = (id: string): Promise<Variable> =>
  go('GET', `/variables/${id}`);

export const saveVariable = (v: Variable): Promise<void> =>
  v.id ? go('PATCH', `/variables/${v.id}`, v) : go('POST', '/variables', v);

export const deleteVariable = (id: string, etag?: string): Promise<void> =>
  go('DELETE', `/variables/${id}`, etag);
