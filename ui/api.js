const host = '';

const thenHandle = (r, resolve, reject) => {
  if (r.status === 204) {
    return resolve();
  } else if (r.status >= 200 && r.status < 300) {
    return r.json().then(resolve);
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
    return go('PATCH', `/collections/${c.id}`, c);
  },

  listJobs: () => go('GET', '/jobs')
};
