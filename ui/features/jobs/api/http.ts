import {api} from '$features/collections';
import {go} from '$shared/api';
import {
  HttpRequest,
  JobDefinition,
  JobHistory,
  JobInput,
  JobItem,
  JobStatus,
  RetryPolicy,
} from '../types';

export const listCollections = api.listCollections;

type ListJobsResponse = {
  items: JobItem[];
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

export const retrieveJob = async (id: string): Promise<JobDefinition> => {
  const data = await go<JobDefinition>('GET', `/jobs/${id}`);
  const {action} = data;
  action.request = {...defaultRequest, ...action.request};
  action.retryPolicy = action.retryPolicy
    ? {...defaultRetryPolicy, ...action.retryPolicy}
    : {...defaultRetryPolicy};
  return data;
};

export const saveJob = (j: JobInput): Promise<void> =>
  j.id ? go('PATCH', `/jobs/${j.id}`, j) : go('POST', '/jobs', j);

export const deleteJob = (id: string, etag?: string): Promise<void> =>
  go('DELETE', `/jobs/${id}`, etag);

export const retrieveJobStatus = (id: string): Promise<JobStatus> =>
  go('GET', `/jobs/${id}/status`);

export const patchJobStatus = (
  id: string,
  status: Partial<JobStatus>,
): Promise<void> => go('PATCH', `/jobs/${id}/status`, status);

export const listJobHistory = (id: string): Promise<ListJobHistoryResponse> =>
  go('GET', `/jobs/${id}/history`);

export const deleteJobHistory = (id: string, etag?: string): Promise<void> =>
  go('DELETE', `/jobs/${id}/history`, etag);

type ListJobHistoryResponse = {
  items: JobHistory[];
};

const defaultRequest: HttpRequest = {
  method: 'GET',
  uri: '',
  headers: [],
  body: '',
};

const defaultRetryPolicy: RetryPolicy = {
  retryCount: 3,
  retryInterval: '10s',
  deadline: '1m',
};
