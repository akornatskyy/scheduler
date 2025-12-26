/* eslint-disable no-redeclare */
import {DomainError, Errors, ValidationError} from '../errors';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type PatchData = {id?: unknown; etag?: string; updated?: unknown};

export function go<T>(method: 'GET', path: string): Promise<T>;
export function go<T>(method: 'POST', path: string, data: unknown): Promise<T>;
export function go<T extends PatchData>(
  method: 'PATCH',
  path: string,
  data: T,
): Promise<void>;
export function go(
  method: 'DELETE',
  path: string,
  etag?: string,
): Promise<void>;
export async function go<T>(
  method: Method,
  path: string,
  data?: unknown,
): Promise<T | void> {
  const options: RequestInit = {method};
  switch (method) {
    case 'DELETE': {
      if (data && typeof data === 'string') {
        options.headers = {'if-match': data};
      }

      break;
    }

    case 'PATCH': {
      const {etag, id: _id, updated: _updated, ...body} = data as PatchData;
      options.headers = {'content-type': 'application/json'};
      if (etag) options.headers['if-match'] = etag;
      options.body = JSON.stringify(body);
      break;
    }

    case 'POST': {
      options.headers = {'content-type': 'application/json'};
      options.body = JSON.stringify(data);
      break;
    }
  }

  const response = await fetch(path, options);
  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T | void> {
  const {status} = response;

  if (status === 201 || status === 204) {
    return;
  }

  if (status >= 200 && status < 300) {
    const data: T & {etag: string} = await response.json();
    const etag = response.headers.get('etag');
    if (etag && data && typeof data === 'object') {
      data.etag = etag;
    }

    return data;
  }

  throw await createErrorFromResponse(response);
}

type FieldError = {type: 'field' | string; location: string; message: string};

type BadRequestResponse = {errors: FieldError[]};

async function createErrorFromResponse(response: Response): Promise<Error> {
  const {status} = response;
  if (status === 400) {
    const parsed: BadRequestResponse = await response.json();
    const details: Errors = {};
    for (const error of parsed.errors) {
      if (error.type === 'field') {
        details[error.location] = error.message;
      } else {
        return new DomainError(error.message, status);
      }
    }

    return new ValidationError(details);
  }

  return new DomainError(response.statusText, status);
}
