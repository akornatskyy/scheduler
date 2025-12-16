export type Job = {
  name: string;
};

export type JobHistoryStatus = 'ready' | 'running' | 'passing' | 'failing';

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
