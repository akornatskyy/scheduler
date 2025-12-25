export type Mutate<S> = (fn: (draft: S) => void) => void;
