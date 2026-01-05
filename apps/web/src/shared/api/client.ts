import {createErrorFromResponse} from './errors';
import {ApiResource} from './resource';

export const client = new ApiResource({
  baseURL: window.location.origin,
  createErrorFromResponse,
});
