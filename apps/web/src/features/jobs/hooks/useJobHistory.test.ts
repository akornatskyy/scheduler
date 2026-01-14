import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import type {JobDefinition, JobHistory, JobStatus} from '../types';
import {useJobHistory} from './useJobHistory';

jest.mock('../api');

const mockNavigate = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {...actual, useNavigate: () => mockNavigate};
});

describe('useJobHistory', () => {
  const id = '1hZsD7XGqPE';
  const job = {id, name: 'Job #1'} as JobDefinition;
  const status = {
    runCount: 2,
    errorCount: 0,
    etag: 'W/"123"',
  } as JobStatus;
  const etag = 'W/"123"';
  beforeEach(() => jest.clearAllMocks());

  it('loads job, status, and history', async () => {
    jest.mocked(api.getJob).mockResolvedValue([job]);
    jest.mocked(api.getJobStatus).mockResolvedValue([status, etag]);
    jest.mocked(api.listJobHistory).mockResolvedValue({
      items: Array.from({length: 10}).map(
        () => ({action: 'HTTP', status: 'completed'}) as JobHistory,
      ),
    });

    const {result} = await act(async () => renderHook(() => useJobHistory(id)));

    expect(api.getJob).toHaveBeenCalledTimes(1);
    expect(api.getJob).toHaveBeenCalledWith(id);
    expect(api.getJobStatus).toHaveBeenCalledTimes(1);
    expect(api.getJobStatus).toHaveBeenCalledWith(id);
    expect(api.listJobHistory).toHaveBeenCalledTimes(1);
    expect(api.listJobHistory).toHaveBeenCalledWith(id);

    expect(result.current.job.name).toBe('Job #1');
    expect(result.current.status.runCount).toBe(2);
    expect(result.current.items).toHaveLength(7);
  });

  it('sets errors when load fails', async () => {
    jest.mocked(api.getJob).mockRejectedValue(new Error('unexpected'));

    const {result} = await act(async () => renderHook(() => useJobHistory(id)));

    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });

  it('navigates back to job', async () => {
    jest.mocked(api.getJob).mockResolvedValue([job]);
    jest.mocked(api.getJobStatus).mockResolvedValue([status, etag]);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});
    const {result} = await act(async () => renderHook(() => useJobHistory(id)));

    await act(async () => {
      result.current.back();
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/jobs/${id}`);
  });

  it('runs job and refreshes status', async () => {
    jest.mocked(api.getJob).mockResolvedValue([job]);
    jest.mocked(api.getJobStatus).mockResolvedValue([status, etag]);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});

    const {result} = await act(async () => renderHook(() => useJobHistory(id)));

    jest
      .mocked(api.getJobStatus)
      .mockResolvedValue([
        {runCount: 3, errorCount: 0} as JobStatus,
        'W/"456"',
      ]);

    await act(async () => {
      await result.current.run();
    });

    expect(api.updateJobStatus).toHaveBeenCalledTimes(1);
    expect(api.updateJobStatus).toHaveBeenCalledWith(
      id,
      {running: true},
      'W/"123"',
    );

    expect(api.getJobStatus).toHaveBeenCalledTimes(2);
    expect(result.current.status.runCount).toBe(3);
  });

  it('sets errors when run fails', async () => {
    jest.mocked(api.getJob).mockResolvedValue([job]);
    jest.mocked(api.getJobStatus).mockResolvedValue([status, etag]);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});
    jest.mocked(api.updateJobStatus).mockRejectedValue(new Error('Run failed'));
    const {result} = await act(async () => renderHook(() => useJobHistory(id)));

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.errors.__ERROR__).toMatch(/Run failed/);
  });

  it('removes job history and navigates back', async () => {
    jest.mocked(api.getJob).mockResolvedValue([job]);
    jest.mocked(api.getJobStatus).mockResolvedValue([status, etag]);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});
    const {result} = await act(async () => renderHook(() => useJobHistory(id)));

    await act(async () => {
      await result.current.remove();
    });

    expect(api.deleteJobHistory).toHaveBeenCalledTimes(1);
    expect(api.deleteJobHistory).toHaveBeenCalledWith(id, 'W/"123"');
    expect(mockNavigate).toHaveBeenCalledWith(`/jobs/${id}`);
  });

  it('sets errors when remove fails', async () => {
    jest.mocked(api.getJob).mockResolvedValue([job]);
    jest.mocked(api.getJobStatus).mockResolvedValue([status, etag]);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});
    jest
      .mocked(api.deleteJobHistory)
      .mockRejectedValue(new Error('Remove failed'));
    const {result} = await act(async () => renderHook(() => useJobHistory(id)));

    await act(async () => {
      await result.current.remove();
    });

    expect(result.current.errors.__ERROR__).toMatch(/Remove failed/);
  });
});
