import {go} from '../../shared/fetch';
import {Variable} from './types';

export {listCollections} from '../collections/collections-api';

export function retrieveVariable(id: string): Promise<Variable> {
  return go('GET', `/variables/${id}`);
}

export function saveVariable(v: Variable): Promise<void> {
  return v.id
    ? go('PATCH', `/variables/${v.id}`, v)
    : go('POST', '/variables', v);
}

export function deleteVariable(id: string, etag?: string): Promise<void> {
  return go('DELETE', `/variables/${id}`, etag);
}
