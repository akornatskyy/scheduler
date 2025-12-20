export type CollectionItem = {
  id: string;
  name: string;
  state: 'enabled' | 'disabled';
};

export type VariableItem = {
  id: string;
  collectionId: string;
  name: string;
  updated: string;
};

export type VariableInput = {
  name: string;
  collectionId: string;
  value: string;
};

export type Variable = VariableInput & {
  id?: string;
  etag?: string;
};
