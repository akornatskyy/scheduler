import {api} from '$features/job';
import {go} from '$shared/fetch';
import {JobHistory, JobStatus} from './types';

export const retrieveJob = api.retrieveJob;

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
