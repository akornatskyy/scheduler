import {client} from '$shared/api';
import type {Collection, CollectionInput, CollectionItem} from '../types';

export const listCollections = () =>
  client.list<CollectionItem>('/collections');

export const getCollection = (id: string) =>
  client.get<Collection>(`/collections/${id}`);

export const createCollection = (data: CollectionInput) =>
  client.post('/collections', data);

export const updateCollection = (
  id: string,
  data: Partial<CollectionInput>,
  etag?: string,
) => client.patch(`/collections/${id}`, data, etag);

export const deleteCollection = (id: string, etag?: string) =>
  client.delete(`/collections/${id}`, etag);
