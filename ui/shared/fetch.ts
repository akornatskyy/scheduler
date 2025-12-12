const host = '';

type FieldErrorMap = Record<string, string>;

type FetchError = {
  __ERROR__: string;
};

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type FieldError = {
  type: 'field' | string;
  location: string;
  message: string;
};

type BadRequestBody = {
  errors: FieldError[];
};

type WithETag = {
  etag: string | null;
};

type Resolve<T> = (value?: T | PromiseLike<T>) => void;
type Reject = (reason?: unknown) => void;

type FetchOptions = {
  method: Method;
  headers: Record<string, string>;
  body?: string;
};

const thenHandle = <T>(r: Response, resolve: Resolve<T>, reject: Reject) => {
  if (r.status === 201 || r.status === 204) {
    return resolve();
  } else if (r.status >= 200 && r.status < 300) {
    return r.json().then((d: T & Partial<WithETag>) => {
      d.etag = r.headers.get('etag');
      resolve(d);
    });
  } else if (r.status === 400) {
    return r.json().then((data: unknown) => {
      const errors: FieldErrorMap = {};
      const body = data as BadRequestBody;
      body.errors
        .filter((err) => err.type === 'field')
        .forEach((err) => {
          errors[err.location] = err.message;
        });
      reject(errors);
    });
  }

  return reject({
    __ERROR__: `${r.status}: ${r.statusText}`,
  } satisfies FetchError);
};

type PatchData = {
  etag: string;
  id?: unknown;
  updated?: unknown;
} & Record<string, unknown>;

type PostData = Record<string, unknown>;

type GoData = string | PatchData | PostData | undefined;

export const go = <T>(method: Method, path: string, data?: GoData) => {
  const options: FetchOptions = {
    method: method,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  };
  switch (method) {
    case 'DELETE':
      options.headers['If-Match'] = String(data ?? '');
      break;
    case 'PATCH': {
      const {etag, id: _id, updated: _updated, ...rest} = data as PatchData;
      options.headers['If-Match'] = etag;
      data = rest;
    }
    // eslint-disable-next-line no-fallthrough
    case 'POST':
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
      break;
  }
  return new Promise<T>((resolve, reject) =>
    fetch(host + path, options as RequestInit)
      .then((r) => thenHandle<T>(r, resolve as Resolve<T>, reject))
      .catch((error: unknown) =>
        reject({
          __ERROR__: (error as {message?: string}).message || 'unknown',
        } satisfies FetchError),
      ),
  );
};
