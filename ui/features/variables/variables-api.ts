import {api} from '$features/collections';
import {go} from '$shared/fetch';
import {Variable} from './types';

export const listCollections = api.listCollections;

type ListVariablesResponse = {
  items: Variable[];
  etag?: string | null;
};

export const listVariables = (
  collectionId?: string | null,
): Promise<ListVariablesResponse> =>
  go(
    'GET',
    collectionId ? `/variables?collectionId=${collectionId}` : '/variables',
  );
