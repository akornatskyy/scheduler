import {go} from '../../shared/fetch';
import {Collection} from './types';

type ListCollectionsResponse = {
  items: Collection[];
};

export function listCollections(): Promise<ListCollectionsResponse> {
  return go('GET', '/collections');
}
