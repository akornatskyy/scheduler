import {go} from '$shared/fetch';
import {Collection} from './types';

type ListCollectionsResponse = {
  items: Collection[];
};

export const listCollections = (): Promise<ListCollectionsResponse> =>
  go('GET', '/collections');
