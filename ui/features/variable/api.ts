import {api} from '$features/collections';
import {go} from '$shared/fetch';
import {Variable} from './types';

export const listCollections = api.listCollections;

export const retrieveVariable = (id: string): Promise<Variable> =>
  go('GET', `/variables/${id}`);

export const saveVariable = (v: Variable): Promise<void> =>
  v.id ? go('PATCH', `/variables/${v.id}`, v) : go('POST', '/variables', v);

export const deleteVariable = (id: string, etag?: string): Promise<void> =>
  go('DELETE', `/variables/${id}`, etag);
