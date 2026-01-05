import {client} from '$shared/api';
import type {
  JobDefinition,
  JobHistory,
  JobInput,
  JobItem,
  JobStatus,
} from '../types';

type ListJobsParams = {
  collectionId?: string | null;
};

export const listJobs = (params: ListJobsParams) =>
  client.list<JobItem>(
    params.collectionId
      ? `/jobs?fields=status,errorRate&collectionId=${params.collectionId}`
      : '/jobs?fields=status,errorRate',
  );

export const getJob = (id: string) => client.get<JobDefinition>(`/jobs/${id}`);

export const createJob = (data: JobInput) => client.post('/jobs', data);

export const updateJob = (id: string, data: Partial<JobInput>, etag?: string) =>
  client.patch(`/jobs/${id}`, data, etag);

export const deleteJob = (id: string, etag?: string) =>
  client.delete(`/jobs/${id}`, etag);

export const getJobStatus = async (id: string) =>
  client.get<JobStatus>(`/jobs/${id}/status`);

export const updateJobStatus = (
  id: string,
  data: Partial<JobStatus>,
  etag?: string,
) => client.patch(`/jobs/${id}/status`, data, etag);

export const listJobHistory = (id: string) =>
  client.list<JobHistory>(`/jobs/${id}/history`);

export const deleteJobHistory = (id: string, etag?: string) =>
  client.delete(`/jobs/${id}/history`, etag);
