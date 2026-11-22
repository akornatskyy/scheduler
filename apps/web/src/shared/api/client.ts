import {ApiResource} from '$shared/lib/resource';
import {$isPending} from '$shared/signals';
import {createTracker} from '$shared/utils';
import {createErrorFromResponse} from './errors';

const trackPending = createTracker($isPending);

export const client = new ApiResource({
  baseURL: window.location.origin,
  fetcher: (input, init) => trackPending(() => fetch(input, init)),
  createErrorFromResponse,
});
