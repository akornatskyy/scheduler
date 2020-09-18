import {go} from '../../shared/fetch';

export function listCollections() {
  return go('GET', '/collections');
}
