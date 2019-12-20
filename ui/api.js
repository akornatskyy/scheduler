import update from 'immutability-helper';

const host = '';

const thenHandle = (r, resolve, reject) => {
  if (r.status === 204) {
    return resolve();
  } else if (r.status >= 200 && r.status < 300) {
    return r.json().then(resolve);
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
    case 'PATCH':
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
  retrieveCollection: (id) => go('GET', `collections/${id}`),
  saveCollection: (c) => {
    if (c.id) {
      return go('PATCH', `/collections/${c.id}`, c);
    }

    return go('POST', '/collections', c);
  },
  deleteCollection: (id) => {
    return go('DELETE', `collections/${id}`);
  },

  listJobs: () => go('GET', '/jobs'),
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
};
