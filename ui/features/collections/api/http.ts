import {go} from '$shared/fetch';
import {Collection, CollectionItem} from '../types';

type ListCollectionsResponse = {
  items: CollectionItem[];
};

export const listCollections = (): Promise<ListCollectionsResponse> =>
  go('GET', '/collections');

export const retrieveCollection = (id: string): Promise<Collection> =>
  go('GET', `/collections/${id}`);

export const saveCollection = (c: Collection): Promise<void> =>
  c.id ? go('PATCH', `/collections/${c.id}`, c) : go('POST', '/collections', c);

export const deleteCollection = (id: string, etag?: string): Promise<void> =>
  go('DELETE', `/collections/${id}`, etag);
