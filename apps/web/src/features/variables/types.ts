export type {CollectionItem} from '$features/collections';

export type VariableItem = {
  id: string;
  collectionId: string;
  name: string;
  updated: string;
};

export type Variable = VariableItem & {
  value: string;
};

export type VariableInput = {
  name: string;
  collectionId: string;
  value: string;
};
