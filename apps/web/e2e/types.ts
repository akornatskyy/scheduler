export type CollectionState = 'enabled' | 'disabled';

export type Collection = {
  id: string;
  name: string;
  state: CollectionState;
};

export type Variable = {
  id: string;
  collectionId: string;
  name: string;
  updated: string;
  value: string;
};

export type JobState = 'enabled' | 'disabled';

export type Job = {
  id: string;
  name: string;
  collectionId: string;
  state: JobState;
  schedule: string;
  action: Action;
};

export type Action = {
  request: HttpRequest;
  retryPolicy: RetryPolicy;
};

export type HttpRequestHeader = {name: string; value: string};

export type HttpRequest = {
  method: string;
  uri: string;
  headers: HttpRequestHeader[];
  body: string;
};

export type RetryPolicy = {
  retryCount: number;
  retryInterval: string;
  deadline: string;
};

export type JobHistoryStatus = 'completed' | 'failed';

export type JobHistory = {
  action: string;
  started: string;
  finished?: string;
  status: JobHistoryStatus;
  retryCount?: number;
  message?: string;
};

export type JobStatus = {
  running: boolean;
  runCount: number;
  errorCount: number;
  lastRun?: string;
  nextRun?: string;
};

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends object | undefined
    ? RecursivePartial<T[P]>
    : T[P];
};
