export type Collection = {
  id: string;
  name: string;
  state: 'enabled' | 'disabled';
};

export type Variable = {
  id: string;
  collectionId: string;
  name: string;
  updated: string;
};
