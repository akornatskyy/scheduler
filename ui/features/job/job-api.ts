import {api} from '$features/collections';
import {go} from '$shared/fetch';
import update from 'immutability-helper';
import {HttpRequest, JobDefinition, JobInput, RetryPolicy} from './types';

export const listCollections = api.listCollections;

export const retrieveJob = async (id: string): Promise<JobDefinition> => {
  const data = await go<JobDefinition>('GET', `/jobs/${id}`);
  const a = data.action;
  a.request = update(defaultRequest, {$merge: a.request});
  if (a.retryPolicy) {
    a.retryPolicy = update(defaultRetryPolicy, {$merge: a.retryPolicy});
  } else {
    a.retryPolicy = {...defaultRetryPolicy};
  }

  return data;
};

export const saveJob = (j: JobInput): Promise<void> =>
  j.id ? go('PATCH', `/jobs/${j.id}`, j) : go('POST', '/jobs', j);

export const deleteJob = (id: string, etag?: string): Promise<void> =>
  go('DELETE', `/jobs/${id}`, etag);

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
