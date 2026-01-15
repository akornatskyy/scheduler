import type {Collection, Job, JobHistory, JobStatus, Variable} from './types';

type Samples = {
  collections: Collection[];
  variables: Variable[];
  jobs: Job[];
  jobStatus: JobStatus;
  jobHistory: JobHistory[];
};

export const samples: Samples = {
  collections: [
    {id: 'cCWE7aLdAcc', name: 'My App #1', state: 'enabled'},
    {id: 'JM2Df539naA', name: 'My Other App', state: 'disabled'},
  ],
  variables: [
    {
      id: 'TnNtM99t9SB',
      collectionId: 'cCWE7aLdAcc',
      name: 'Host',
      updated: '2020-09-24T16:38:21.810504+03:00',
      value: 'localhost:8080',
    },
    {
      id: '9fHXTAx6j29',
      name: 'Token',
      collectionId: 'cCWE7aLdAcc',
      updated: '2020-09-17T22:17:59.057923+03:00',
      value: '12345',
    },
  ],
  jobs: [
    {
      id: 'j1R17KQxAvy',
      name: 'My Task #1',
      collectionId: 'cCWE7aLdAcc',
      state: 'disabled',
      schedule: '@every 15s',
      action: {
        request: {
          method: 'POST',
          uri: 'http://{{.Host}}',
          headers: [{name: 'Authorization', value: 'Bearer: {{.Token}}'}],
          body: '{}',
        },
        retryPolicy: {retryCount: 3, retryInterval: '10s', deadline: '1m0s'},
      },
    },
    {
      id: '7jFGwbpvWkR',
      name: 'My Task #2',
      collectionId: 'JM2Df539naA',
      state: 'enabled',
      schedule: '@every 1m',
      action: {
        request: {
          method: 'GET',
          uri: 'http://localhost:8080/health',
          headers: [{name: 'Content-Type', value: 'application/json'}],
          body: '',
        },
        retryPolicy: {retryCount: 3, retryInterval: '10s', deadline: '1m0s'},
      },
    },
  ],
  jobStatus: {
    running: false,
    runCount: 589,
    errorCount: 115,
    lastRun: '2026-01-04T17:25:20.000Z',
  },
  jobHistory: [
    {
      action: 'HTTP',
      started: '2026-01-04T17:25:20.000Z',
      finished: '2026-01-04T17:25:24.000Z',
      status: 'completed',
    },
    {
      action: 'HTTP',
      started: '2025-12-31T08:21:20.000Z',
      finished: '2025-12-31T08:21:47.000Z',
      retryCount: 2,
      status: 'failed',
      message: '404 Not Found',
    },
  ],
};
