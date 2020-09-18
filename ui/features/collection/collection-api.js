import {go} from '../../shared/fetch';


export function retrieveCollection(id) {
  return go('GET', `/collections/${id}`);
}

export function saveCollection(c) {
  if (c.id) {
    return go('PATCH', `/collections/${c.id}`, c);
  }

  return go('POST', '/collections', c);
}

export function deleteCollection(id, etag) {
  return go('DELETE', `/collections/${id}`, etag);
}
