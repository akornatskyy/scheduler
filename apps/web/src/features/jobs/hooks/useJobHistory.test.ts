import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import {JobDefinition, JobHistory, JobStatus} from '../types';
import {useJobHistory} from './useJobHistory';

jest.mock('../api');

const mockNavigate = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {...actual, useNavigate: () => mockNavigate};
});

describe('useJobHistory', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads job, status, and history', async () => {
    jest
      .mocked(api.getJob)
      .mockResolvedValue({name: 'Job #1'} as JobDefinition);
    jest.mocked(api.getJobStatus).mockResolvedValue({
      runCount: 2,
      errorCount: 0,
      etag: 'W/"123"',
    } as JobStatus);
    jest.mocked(api.getJobHistory).mockResolvedValue({
      items: Array.from({length: 10}).map(
        () => ({action: 'HTTP', status: 'ready'} as JobHistory),
      ),
    });

    const {result} = await act(async () =>
      renderHook(() => useJobHistory('j1')),
    );

    expect(api.getJob).toHaveBeenCalledTimes(1);
    expect(api.getJob).toHaveBeenCalledWith('j1');
    expect(api.getJobStatus).toHaveBeenCalledTimes(1);
    expect(api.getJobStatus).toHaveBeenCalledWith('j1');
    expect(api.getJobHistory).toHaveBeenCalledTimes(1);
    expect(api.getJobHistory).toHaveBeenCalledWith('j1');

    expect(result.current.job.name).toBe('Job #1');
    expect(result.current.status.runCount).toBe(2);
    expect(result.current.items).toHaveLength(7);
  });

  it('sets errors when load fails', async () => {
    jest.mocked(api.getJob).mockRejectedValue(new Error('unexpected'));

    const {result} = await act(async () =>
      renderHook(() => useJobHistory('j1')),
    );

    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });

  it('navigates back to job', async () => {
    jest
      .mocked(api.getJob)
      .mockResolvedValue({name: 'Job #1'} as JobDefinition);
    jest.mocked(api.getJobStatus).mockResolvedValue({
      runCount: 2,
      errorCount: 0,
      etag: 'W/"123"',
    } as JobStatus);
    jest.mocked(api.getJobHistory).mockResolvedValue({items: []});

    const {result} = await act(async () =>
      renderHook(() => useJobHistory('j1')),
    );

    await act(async () => {
      result.current.back();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/jobs/j1');
  });

  it('runs job and refreshes status', async () => {
    jest
      .mocked(api.getJob)
      .mockResolvedValue({name: 'Job #1'} as JobDefinition);
    jest.mocked(api.getJobStatus).mockResolvedValue({
      runCount: 2,
      errorCount: 0,
      etag: 'W/"123"',
    } as JobStatus);
    jest.mocked(api.getJobHistory).mockResolvedValue({items: []});

    const {result} = await act(async () =>
      renderHook(() => useJobHistory('j1')),
    );

    jest.mocked(api.getJobStatus).mockResolvedValue({
      runCount: 3,
      errorCount: 0,
      etag: 'W/"456"',
    } as JobStatus);

    await act(async () => {
      await result.current.run();
    });

    expect(api.updateJobStatus).toHaveBeenCalledTimes(1);
    expect(api.updateJobStatus).toHaveBeenCalledWith('j1', {
      running: true,
      etag: 'W/"123"',
    });

    expect(api.getJobStatus).toHaveBeenCalledTimes(2);
    expect(result.current.status.runCount).toBe(3);
  });

  it('sets errors when run fails', async () => {
    jest
      .mocked(api.getJob)
      .mockResolvedValue({name: 'Job #1'} as JobDefinition);
    jest.mocked(api.getJobStatus).mockResolvedValue({
      runCount: 2,
      errorCount: 0,
      etag: 'W/"123"',
    } as JobStatus);
    jest.mocked(api.getJobHistory).mockResolvedValue({items: []});
    jest.mocked(api.updateJobStatus).mockRejectedValue(new Error('Run failed'));

    const {result} = await act(async () =>
      renderHook(() => useJobHistory('j1')),
    );

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.errors.__ERROR__).toMatch(/Run failed/);
  });

  it('removes job history and navigates back', async () => {
    jest
      .mocked(api.getJob)
      .mockResolvedValue({name: 'Job #1'} as JobDefinition);
    jest.mocked(api.getJobStatus).mockResolvedValue({
      runCount: 2,
      errorCount: 0,
      etag: 'W/"123"',
    } as JobStatus);
    jest.mocked(api.getJobHistory).mockResolvedValue({items: []});

    const {result} = await act(async () =>
      renderHook(() => useJobHistory('j1')),
    );

    await act(async () => {
      await result.current.remove();
    });

    expect(api.deleteJobHistory).toHaveBeenCalledTimes(1);
    expect(api.deleteJobHistory).toHaveBeenCalledWith('j1', 'W/"123"');
    expect(mockNavigate).toHaveBeenCalledWith('/jobs/j1');
  });

  it('sets errors when remove fails', async () => {
    jest
      .mocked(api.getJob)
      .mockResolvedValue({name: 'Job #1'} as JobDefinition);
    jest.mocked(api.getJobStatus).mockResolvedValue({
      runCount: 2,
      errorCount: 0,
      etag: 'W/"123"',
    } as JobStatus);
    jest.mocked(api.getJobHistory).mockResolvedValue({items: []});
    jest
      .mocked(api.deleteJobHistory)
      .mockRejectedValue(new Error('Remove failed'));

    const {result} = await act(async () =>
      renderHook(() => useJobHistory('j1')),
    );

    await act(async () => {
      await result.current.remove();
    });

    expect(result.current.errors.__ERROR__).toMatch(/Remove failed/);
  });
});
