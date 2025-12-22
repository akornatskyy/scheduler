export type CollectionState = 'enabled' | 'disabled';

export type CollectionItem = {
  id: string;
  name: string;
  state: CollectionState;
};

export type Collection = {
  id: string;
  name: string;
  state: CollectionState;
  updated: string;
  etag?: string;
};

export type CollectionInput = {
  id?: string;
  name: string;
  state: CollectionState;
  etag?: string;
};
