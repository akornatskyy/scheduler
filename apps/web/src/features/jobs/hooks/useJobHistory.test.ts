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
      .mocked(api.retrieveJob)
      .mockResolvedValue({name: 'Job #1'} as JobDefinition);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue({
      runCount: 2,
      errorCount: 0,
      etag: 'W/"123"',
    } as JobStatus);
    jest.mocked(api.listJobHistory).mockResolvedValue({
      items: Array.from({length: 10}).map(
        () => ({action: 'HTTP', status: 'ready'} as JobHistory),
      ),
    });

    const {result} = await act(async () =>
      renderHook(() => useJobHistory('j1')),
    );

    expect(api.retrieveJob).toHaveBeenCalledTimes(1);
    expect(api.retrieveJob).toHaveBeenCalledWith('j1');
    expect(api.retrieveJobStatus).toHaveBeenCalledTimes(1);
    expect(api.retrieveJobStatus).toHaveBeenCalledWith('j1');
    expect(api.listJobHistory).toHaveBeenCalledTimes(1);
    expect(api.listJobHistory).toHaveBeenCalledWith('j1');

    expect(result.current.job.name).toBe('Job #1');
    expect(result.current.status.runCount).toBe(2);
    expect(result.current.items).toHaveLength(7);
  });

  it('sets errors when load fails', async () => {
    jest.mocked(api.retrieveJob).mockRejectedValue(new Error('Unexpected'));

    const {result} = await act(async () =>
      renderHook(() => useJobHistory('j1')),
    );

    expect(result.current.errors.__ERROR__).toMatch(/Unexpected/);
  });

  it('navigates back to job', async () => {
    jest
      .mocked(api.retrieveJob)
      .mockResolvedValue({name: 'Job #1'} as JobDefinition);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue({
      runCount: 2,
      errorCount: 0,
      etag: 'W/"123"',
    } as JobStatus);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});

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
      .mocked(api.retrieveJob)
      .mockResolvedValue({name: 'Job #1'} as JobDefinition);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue({
      runCount: 2,
      errorCount: 0,
      etag: 'W/"123"',
    } as JobStatus);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});

    const {result} = await act(async () =>
      renderHook(() => useJobHistory('j1')),
    );

    jest.mocked(api.retrieveJobStatus).mockResolvedValue({
      runCount: 3,
      errorCount: 0,
      etag: 'W/"456"',
    } as JobStatus);

    await act(async () => {
      await result.current.run();
    });

    expect(api.patchJobStatus).toHaveBeenCalledTimes(1);
    expect(api.patchJobStatus).toHaveBeenCalledWith('j1', {
      running: true,
      etag: 'W/"123"',
    });

    expect(api.retrieveJobStatus).toHaveBeenCalledTimes(2);
    expect(result.current.status.runCount).toBe(3);
  });

  it('sets errors when run fails', async () => {
    jest
      .mocked(api.retrieveJob)
      .mockResolvedValue({name: 'Job #1'} as JobDefinition);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue({
      runCount: 2,
      errorCount: 0,
      etag: 'W/"123"',
    } as JobStatus);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});
    jest.mocked(api.patchJobStatus).mockRejectedValue(new Error('Run failed'));

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
      .mocked(api.retrieveJob)
      .mockResolvedValue({name: 'Job #1'} as JobDefinition);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue({
      runCount: 2,
      errorCount: 0,
      etag: 'W/"123"',
    } as JobStatus);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});

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
      .mocked(api.retrieveJob)
      .mockResolvedValue({name: 'Job #1'} as JobDefinition);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue({
      runCount: 2,
      errorCount: 0,
      etag: 'W/"123"',
    } as JobStatus);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});
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
