import {go} from '../../shared/fetch';

export {listCollections} from '../collections/collections-api';

export function listJobs(collectionId) {
  return go(
    'GET',
    collectionId
      ? `/jobs?fields=status,errorRate&collectionId=${collectionId}`
      : '/jobs?fields=status,errorRate',
  );
}
