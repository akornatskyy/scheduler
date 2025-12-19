import {api} from '$features/collections';
import {go} from '$shared/fetch';
import {Job} from './types';

export const listCollections = api.listCollections;

type ListJobsResponse = {
  items: Job[];
  etag?: string | null;
};

export const listJobs = (
  collectionId?: string | null,
): Promise<ListJobsResponse> =>
  go(
    'GET',
    collectionId
      ? `/jobs?fields=status,errorRate&collectionId=${collectionId}`
      : '/jobs?fields=status,errorRate',
  );
