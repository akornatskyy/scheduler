import {go} from '../../shared/fetch';
import {Job} from './types';

export {listCollections} from '../collections/collections-api';

type ListJobsResponse = {
  items: Job[];
  etag?: string | null;
};

export function listJobs(
  collectionId?: string | null,
): Promise<ListJobsResponse> {
  return go(
    'GET',
    collectionId
      ? `/jobs?fields=status,errorRate&collectionId=${collectionId}`
      : '/jobs?fields=status,errorRate',
  );
}
