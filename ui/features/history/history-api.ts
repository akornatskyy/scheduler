import {go} from '../../shared/fetch';
import {JobHistory, JobStatus} from './types';

export {retrieveJob} from '../job/job-api';

export function retrieveJobStatus(id: string): Promise<JobStatus> {
  return go('GET', `/jobs/${id}/status`);
}

export function patchJobStatus(
  id: string,
  status: Partial<JobStatus>,
): Promise<void> {
  return go('PATCH', `/jobs/${id}/status`, status);
}

export function listJobHistory(id: string): Promise<ListJobHistoryResponse> {
  return go('GET', `/jobs/${id}/history`);
}

export function deleteJobHistory(id: string, etag?: string): Promise<void> {
  return go('DELETE', `/jobs/${id}/history`, etag);
}

type ListJobHistoryResponse = {
  items: JobHistory[];
};
