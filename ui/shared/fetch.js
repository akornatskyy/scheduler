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

export const go = (method, path, data) => {
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
