import {go} from '../../shared/fetch';
import {Collection} from './types';

export function retrieveCollection(id: string): Promise<Collection> {
  return go('GET', `/collections/${id}`);
}

export function saveCollection(c: Collection): Promise<void> {
  return c.id
    ? go('PATCH', `/collections/${c.id}`, c)
    : go('POST', '/collections', c);
}

export function deleteCollection(id: string, etag?: string): Promise<void> {
  return go('DELETE', `/collections/${id}`, etag);
}
