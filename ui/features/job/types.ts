export type Collection = {
  id: string;
  name: string;
};

export type JobState = 'enabled' | 'disabled';

export type JobStatus = 'ready' | 'running' | 'passing' | 'failing';

export type JobInput = {
  id?: string;
  name: string;
  collectionId: string;
  state: JobState;
  schedule: string;
  action: Action;
  etag?: string;
};

export type JobItem = {
  id: string;
  name: string;
  collectionId: string;
  state: JobState;
  schedule: string;
  status: JobStatus;
  errorRate: number;
};

export type JobDefinition = JobItem & {
  updated: string;
  action: Action;
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
