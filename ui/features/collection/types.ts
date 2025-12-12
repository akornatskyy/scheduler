export type Collection = {
  id?: string;
  name: string;
  state: 'enabled' | 'disabled';
  etag?: string;
  updated?: string;
};
