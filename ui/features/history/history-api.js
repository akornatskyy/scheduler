import {go} from '../../shared/fetch';

export {retrieveJob} from '../job/job-api';


export function retrieveJobStatus(id) {
  return go('GET', `/jobs/${id}/status`);
}

export function patchJobStatus(id, j) {
  return go('PATCH', `/jobs/${id}/status`, j);
}

export function listJobHistory(id) {
  return go('GET', `/jobs/${id}/history`);
}

export function deleteJobHistory(id, etag) {
  return go('DELETE', `/jobs/${id}/history`, etag);
}
