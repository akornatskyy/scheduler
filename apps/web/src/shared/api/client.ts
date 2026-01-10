import {ApiResource} from '$shared/lib/resource';
import {trackPending} from '$shared/utils';
import {createErrorFromResponse} from './errors';

export const client = new ApiResource({
  baseURL: window.location.origin,
  fetcher: (input, init) => trackPending(() => fetch(input, init)),
  createErrorFromResponse,
});
