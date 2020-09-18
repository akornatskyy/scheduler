import {go} from '../../shared/fetch';

export {listCollections} from '../collections/collections-api';


export function listVariables(collectionId) {
  return go('GET',
    collectionId ? `/variables?collectionId=${collectionId}` : '/variables');
}
