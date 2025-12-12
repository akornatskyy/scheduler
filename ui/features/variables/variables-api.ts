import {go} from '../../shared/fetch';
import {Variable} from './types';

export {listCollections} from '../collections/collections-api';

type ListVariablesResponse = {
  items: Variable[];
  etag?: string | null;
};

export function listVariables(
  collectionId?: string | null,
): Promise<ListVariablesResponse> {
  return go(
    'GET',
    collectionId ? `/variables?collectionId=${collectionId}` : '/variables',
  );
}
