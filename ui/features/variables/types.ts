export type {CollectionItem} from '$features/collections';

export type VariableItem = {
  id: string;
  collectionId: string;
  name: string;
  updated: string;
};

export type Variable = VariableItem & {
  value: string;
  etag?: string;
};

export type VariableInput = {
  id?: string;
  collectionId: string;
  name: string;
  value: string;
  etag?: string;
};
