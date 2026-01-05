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
};

export type CollectionInput = {
  name: string;
  state: CollectionState;
};
