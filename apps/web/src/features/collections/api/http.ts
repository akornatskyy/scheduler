import {go} from '$shared/api';
import {Collection, CollectionInput, CollectionItem} from '../types';

type GetCollectionsResponse = {
  items: CollectionItem[];
};

export const getCollections = (): Promise<GetCollectionsResponse> =>
  go('GET', '/collections');

export const getCollection = (id: string): Promise<Collection> =>
  go('GET', `/collections/${id}`);

export const createCollection = (c: CollectionInput): Promise<void> =>
  go('POST', '/collections', c);

export const updateCollection = (c: CollectionInput): Promise<void> =>
  go('PATCH', `/collections/${c.id}`, c);

export const deleteCollection = (id: string, etag?: string): Promise<void> =>
  go('DELETE', `/collections/${id}`, etag);
