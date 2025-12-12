import update from 'immutability-helper';
import {go} from '../../shared/fetch';
import {HttpRequest, JobDefinition, JobInput, RetryPolicy} from './types';
export {listCollections} from '../collections/collections-api';

export async function retrieveJob(id: string): Promise<JobDefinition> {
  const data = await go<JobDefinition>('GET', `/jobs/${id}`);

  const a = data.action;
  a.request = update(defaultRequest, {$merge: a.request});
  if (a.retryPolicy) {
    a.retryPolicy = update(defaultRetryPolicy, {$merge: a.retryPolicy});
  } else {
    a.retryPolicy = {...defaultRetryPolicy};
  }

  return data;
}

export function saveJob(j: JobInput): Promise<void> {
  return j.id ? go('PATCH', `/jobs/${j.id}`, j) : go('POST', '/jobs', j);
}

export function deleteJob(id: string, etag?: string): Promise<void> {
  return go('DELETE', `/jobs/${id}`, etag);
}

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
