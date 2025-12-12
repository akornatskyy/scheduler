export type Collection = {
  id: string;
  name: string;
  state: string;
};

export type JobState = 'enabled' | 'disabled';

export type JobStatus = 'ready' | 'running' | 'passing' | 'failing';

export type Job = {
  id: string;
  collectionId: string;
  name: string;
  schedule: string;
  state: JobState;
  status: JobStatus;
  errorRate?: number;
};
