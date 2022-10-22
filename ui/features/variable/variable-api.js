import {go} from '../../shared/fetch';

export {listCollections} from '../collections/collections-api';

export function retrieveVariable(id) {
  return go('GET', `/variables/${id}`);
}

export function saveVariable(c) {
  if (c.id) {
    return go('PATCH', `/variables/${c.id}`, c);
  }

  return go('POST', '/variables', c);
}

export function deleteVariable(id, etag) {
  return go('DELETE', `/variables/${id}`, etag);
}
