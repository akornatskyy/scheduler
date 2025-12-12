export type Collection = {
  id?: string;
  name: string;
};

export type VariableInput = {
  name: string;
  collectionId: string;
  value: string;
};

export type VariableItem = {
  id?: string;
  name: string;
  collectionId: string;
};

export type Variable = VariableItem & {
  etag?: string;
  value: string;
};
