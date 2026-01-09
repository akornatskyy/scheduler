import {client} from '$shared/api';
import type {GetResourceResponse, ListResourceResponse} from '$shared/lib';
import type {
  JobDefinition,
  JobHistory,
  JobInput,
  JobItem,
  JobStatus,
} from '../types';
import * as api from './http';

jest.mock('$shared/api');

describe('jobs api', () => {
  const item = {id: '123'} as JobDefinition;

  beforeEach(() => jest.clearAllMocks());

  it('listJobs() calls client.list with /jobs?fields=status,errorRate', async () => {
    const payload: ListResourceResponse<JobItem> = {
      items: [item],
    };
    jest.mocked(client).list.mockResolvedValue(payload);

    const result = await api.listJobs({});

    expect(result).toBe(payload);
    expect(client.list).toHaveBeenCalledWith('/jobs?fields=status,errorRate');
  });

  it('listJobs() calls client.list with /jobs?fields=status,errorRate&collectionId when collectionId provided', async () => {
    const payload: ListResourceResponse<JobItem> = {
      items: [item],
    };
    jest.mocked(client).list.mockResolvedValue(payload);

    const result = await api.listJobs({collectionId: 'c1'});

    expect(result).toBe(payload);
    expect(client.list).toHaveBeenCalledWith(
      '/jobs?fields=status,errorRate&collectionId=c1',
    );
  });

  it('getJob() calls client.get with /jobs/:id', async () => {
    const payload: GetResourceResponse<JobDefinition> = [item, 'W/"1"'];
    jest.mocked(client).get.mockResolvedValue(payload);

    const result = await api.getJob('j1');

    expect(result).toBe(payload);
    expect(client.get).toHaveBeenCalledWith('/jobs/j1');
  });

  it('createJob() calls client.post with /jobs', async () => {
    jest.mocked(client).post.mockResolvedValue('new-id');

    const id = await api.createJob(item);

    expect(id).toBe('new-id');
    expect(client.post).toHaveBeenCalledWith('/jobs', item);
  });

  it('updateJob() calls client.patch with /jobs/:id', async () => {
    const input: Partial<JobInput> = {name: 'New Name'};
    await api.updateJob('j1', input, 'W/"1"');

    expect(client.patch).toHaveBeenCalledWith('/jobs/j1', input, 'W/"1"');
  });

  it('deleteJob() calls client.del with /jobs/:id', async () => {
    await api.deleteJob('j1', 'W/"2"');

    expect(client.delete).toHaveBeenCalledWith('/jobs/j1', 'W/"2"');
  });

  it('getJobStatus() calls client.get with /jobs/:id/status', async () => {
    const payload: GetResourceResponse<JobStatus> = [
      {runCount: 4} as JobStatus,
      'W/"1"',
    ];
    jest.mocked(client).get.mockResolvedValue(payload);

    const result = await api.getJobStatus('j1');

    expect(result).toBe(payload);
    expect(client.get).toHaveBeenCalledWith('/jobs/j1/status');
  });

  it('updateJobStatus() calls client.patch with /jobs/:id/status', async () => {
    const statusData = {status: 'completed'} as Partial<JobStatus>;

    await api.updateJobStatus('j1', statusData, 'W/"1"');

    expect(client.patch).toHaveBeenCalledWith(
      '/jobs/j1/status',
      statusData,
      'W/"1"',
    );
  });

  it('listJobHistory() calls client.list with /jobs/:id/history', async () => {
    const payload: ListResourceResponse<JobHistory> = {
      items: [{status: 'ready'} as JobHistory],
    };
    jest.mocked(client).list.mockResolvedValue(payload);

    const result = await api.listJobHistory('j1');

    expect(result).toBe(payload);
    expect(client.list).toHaveBeenCalledWith('/jobs/j1/history');
  });

  it('deleteJobHistory() calls client.del with /jobs/:id/history', async () => {
    await api.deleteJobHistory('j1', 'W/"2"');

    expect(client.delete).toHaveBeenCalledWith('/jobs/j1/history', 'W/"2"');
  });
});
