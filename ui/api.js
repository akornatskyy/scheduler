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

  listJobs: () => go('GET', '/jobs')
};