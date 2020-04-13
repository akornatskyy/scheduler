import update from 'immutability-helper';

const host = '';

const thenHandle = (r, resolve, reject) => {
  if (r.status === 201 || r.status === 204) {
    return resolve();
  } else if (r.status >= 200 && r.status < 300) {
    return r.json().then((d) => {
      d.etag = r.headers.get('etag');
      resolve(d);
    });
  } else if (r.status === 400) {
    return r.json().then((data) => {
      const errors = {};
      data.errors
          .filter((err) => err.type === 'field')
          .forEach((err) => {
            errors[err.location] = err.message;
          });
      reject(errors);
    });
  }

  return reject({__ERROR__: `${r.status}: ${r.statusText}`});
};

const go = (method, path, data) => {
  const options = {
    method: method,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  };
  switch (method) {
    case 'DELETE':
      options.headers['If-Match'] = data;
      break;
    case 'PATCH':
      options.headers['If-Match'] = data.etag;
      data = {...data};
      delete data.id;
      delete data.etag;
      delete data.updated;
    // eslint-disable-next-line no-fallthrough
    case 'POST':
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
      break;
  }
  return new Promise((resolve, reject) =>
    fetch(host + path, options)
        .then((r) => thenHandle(r, resolve, reject))
        .catch((error) => reject({__ERROR__: error.message}))
  );
};

const defaultRequest = {
  method: 'GET',
  headers: [],
  body: ''
};

const defaultRetryPolicy = {
  retryCount: 3,
  retryInterval: '10s',
  deadline: '1m'
};

export default {
  listCollections: () => go('GET', '/collections'),
  retrieveCollection: (id) => go('GET', `/collections/${id}`),
  saveCollection: (c) => {
    if (c.id) {
      return go('PATCH', `/collections/${c.id}`, c);
    }

    return go('POST', '/collections', c);
  },
  deleteCollection: (id, etag) => {
    return go('DELETE', `/collections/${id}`, etag);
  },

  listVariables: (collectionId) =>
    go('GET',
       collectionId ? `/variables?collectionId=${collectionId}` : '/variables'),
  retrieveVariable: (id) => go('GET', `/variables/${id}`),
  saveVariable: (c) => {
    if (c.id) {
      return go('PATCH', `/variables/${c.id}`, c);
    }

    return go('POST', '/variables', c);
  },
  deleteVariable: (id, etag) => {
    return go('DELETE', `/variables/${id}`, etag);
  },

  listJobs: (collectionId) =>
    go('GET', collectionId ?
    `/jobs?fields=status,errorRate&collectionId=${collectionId}` :
    '/jobs?fields=status,errorRate'),
  retrieveJob: (id) =>
    go('GET', `/jobs/${id}`).then((data) => {
      const a = data.action;
      a.request = update(defaultRequest, {$merge: a.request});
      if (a.retryPolicy) {
        a.retryPolicy = update(defaultRetryPolicy, {$merge: a.retryPolicy});
      } else {
        a.retryPolicy = {...defaultRetryPolicy};
      }

      return data;
    }),
  saveJob: (j) => {
    if (j.id) {
      return go('PATCH', `/jobs/${j.id}`, j);
    }

    return go('POST', '/jobs', j);
  },
  deleteJob: (id, etag) => go('DELETE', `/jobs/${id}`, etag),

  retrieveJobStatus: (id) => go('GET', `/jobs/${id}/status`),
  patchJobStatus: (id, j) => go('PATCH', `/jobs/${id}/status`, j),

  listJobHistory: (id) => go('GET', `/jobs/${id}/history`),
  deleteJobHistory: (id, etag) => go('DELETE', `/jobs/${id}/history`, etag)
};
