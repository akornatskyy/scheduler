const host = '';

const thenHandle = (r, resolve, reject) => {
  if (r.status >= 200 && r.status < 300) {
    return r.json().then(resolve);
  }

  return reject({__ERROR__: `${r.status}: ${r.statusText}`});
};

const go = (method, path) => {
  const options = {
    method: method,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  };
  return new Promise((resolve, reject) =>
    fetch(host + path, options)
        .then((r) => thenHandle(r, resolve, reject))
        .catch((error) => reject({__ERROR__: error.message}))
  );
};

export default {
  listCollections: () => go('GET', '/collections'),
  retrieveCollection: (id) => go('GET', `collections/${id}`),

  listJobs: () => go('GET', '/jobs')
};
