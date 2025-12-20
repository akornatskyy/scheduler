export type CollectionItem = {
  id: string;
  name: string;
  state: string;
};

export type JobState = 'enabled' | 'disabled';

export type JobHistoryStatus = 'ready' | 'running' | 'passing' | 'failing';

export type JobItem = {
  id: string;
  collectionId: string;
  name: string;
  schedule: string;
  state: JobState;
  status: JobHistoryStatus;
  errorRate?: number;
};

export type JobInput = {
  id?: string;
  name: string;
  collectionId: string;
  state: JobState;
  schedule: string;
  action: Action;
  etag?: string;
};

export type JobDefinition = JobItem & {
  updated: string;
  action: Action;
  etag?: string;
};

export type Action = {
  type: 'HTTP';
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

export type JobHistory = {
  action: string;
  started: string;
  finished?: string;
  status: JobHistoryStatus;
  retryCount?: number;
  message?: string;
};

export type JobStatus = {
  running?: boolean;
  runCount: number;
  errorCount: number;
  lastRun?: string;
  nextRun?: string;
  etag?: string;
};
