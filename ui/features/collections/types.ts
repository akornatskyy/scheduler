export type CollectionItem = {
  id: string;
  name: string;
  state: 'enabled' | 'disabled';
};

export type Collection = {
  id?: string;
  name: string;
  state: 'enabled' | 'disabled';
  etag?: string;
  updated?: string;
};
