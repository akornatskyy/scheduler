import {go} from '$shared/api';
import {
  JobDefinition,
  JobHistory,
  JobInput,
  JobItem,
  JobStatus,
} from '../types';

type GetJobsResponse = {
  items: JobItem[];
};

export const getJobs = (
  collectionId?: string | null,
): Promise<GetJobsResponse> =>
  go(
    'GET',
    collectionId
      ? `/jobs?fields=status,errorRate&collectionId=${collectionId}`
      : '/jobs?fields=status,errorRate',
  );

export const getJob = async (id: string): Promise<JobDefinition> => {
  const data = await go<JobDefinition>('GET', `/jobs/${id}`);
  const {action} = data;
  action.request = {
    ...{method: 'GET', uri: '', headers: [], body: ''},
    ...action.request,
  };
  action.retryPolicy = {
    ...{retryCount: 3, retryInterval: '10s', deadline: '1m'},
    ...action.retryPolicy,
  };
  return data;
};

export const createJob = (j: JobInput): Promise<void> => go('POST', '/jobs', j);

export const updateJob = (j: JobInput): Promise<void> =>
  go('PATCH', `/jobs/${j.id}`, j);

export const deleteJob = (id: string, etag?: string): Promise<void> =>
  go('DELETE', `/jobs/${id}`, etag);

export const getJobStatus = (id: string): Promise<JobStatus> =>
  go('GET', `/jobs/${id}/status`);

export const updateJobStatus = (
  id: string,
  status: Partial<JobStatus>,
): Promise<void> => go('PATCH', `/jobs/${id}/status`, status);

type GetJobHistoryResponse = {
  items: JobHistory[];
};

export const getJobHistory = (id: string): Promise<GetJobHistoryResponse> =>
  go('GET', `/jobs/${id}/history`);

export const deleteJobHistory = (id: string, etag?: string): Promise<void> =>
  go('DELETE', `/jobs/${id}/history`, etag);
