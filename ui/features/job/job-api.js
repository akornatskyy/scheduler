import update from 'immutability-helper';

import {go} from '../../shared/fetch';
export {listCollections} from '../collections/collections-api';

const defaultRequest = {
  method: 'GET',
  headers: [],
  body: '',
};

const defaultRetryPolicy = {
  retryCount: 3,
  retryInterval: '10s',
  deadline: '1m',
};

export function retrieveJob(id) {
  return go('GET', `/jobs/${id}`).then((data) => {
    const a = data.action;
    a.request = update(defaultRequest, {$merge: a.request});
    if (a.retryPolicy) {
      a.retryPolicy = update(defaultRetryPolicy, {$merge: a.retryPolicy});
    } else {
      a.retryPolicy = {...defaultRetryPolicy};
    }

    return data;
  });
}

export function saveJob(j) {
  if (j.id) {
    return go('PATCH', `/jobs/${j.id}`, j);
  }

  return go('POST', '/jobs', j);
}

export function deleteJob(id, etag) {
  return go('DELETE', `/jobs/${id}`, etag);
}
