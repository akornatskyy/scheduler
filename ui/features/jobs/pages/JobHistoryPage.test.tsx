import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Route, MemoryRouter as Router, Routes} from 'react-router';
import * as api from '../api';
import {JobHistory, JobStatus} from '../types';
import {JobHistoryPage} from './JobHistoryPage';

jest.mock('../api');

const mockNavigate = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('job history page', () => {
  const job = {name: 'My Task'} as Awaited<ReturnType<typeof api.retrieveJob>>;
  const jobStatus = {etag: '"1n9er1hz749r"'} as JobStatus;

  beforeEach(() => jest.clearAllMocks());

  it('handles retrieve job error', async () => {
    jest.mocked(api.retrieveJob).mockRejectedValue(new Error('Unexpected'));
    jest.mocked(api.retrieveJobStatus).mockResolvedValue(jobStatus);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});

    await actRender();

    expect(api.retrieveJob).toHaveBeenCalledTimes(1);
    expect(api.retrieveJob).toHaveBeenCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toHaveBeenCalledTimes(1);
    expect(api.retrieveJobStatus).toHaveBeenCalledWith('65ada2f9');
    expect(api.listJobHistory).toHaveBeenCalledTimes(1);
    expect(api.listJobHistory).toHaveBeenCalledWith('65ada2f9');
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('handles retrieve job status error', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest
      .mocked(api.retrieveJobStatus)
      .mockRejectedValue(new Error('Unexpected'));
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});

    await actRender();

    expect(api.retrieveJob).toHaveBeenCalledTimes(1);
    expect(api.retrieveJob).toHaveBeenCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toHaveBeenCalledTimes(1);
    expect(api.retrieveJobStatus).toHaveBeenCalledWith('65ada2f9');
    expect(api.listJobHistory).toHaveBeenCalledTimes(1);
    expect(api.listJobHistory).toHaveBeenCalledWith('65ada2f9');
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('handles list job history error', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue(jobStatus);
    jest.mocked(api.listJobHistory).mockRejectedValue(new Error('Unexpected'));

    await actRender();

    expect(api.retrieveJob).toHaveBeenCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toHaveBeenCalledTimes(1);
    expect(api.retrieveJobStatus).toHaveBeenCalledWith('65ada2f9');
    expect(api.listJobHistory).toHaveBeenCalledTimes(1);
    expect(api.listJobHistory).toHaveBeenCalledWith('65ada2f9');
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('updates state with fetched items', async () => {
    const status = {running: true} as JobStatus;
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue(status);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});

    await actRender();

    expect(api.retrieveJob).toHaveBeenCalledTimes(1);
    expect(api.retrieveJob).toHaveBeenCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toHaveBeenCalledTimes(1);
    expect(api.retrieveJobStatus).toHaveBeenCalledWith('65ada2f9');
    expect(api.listJobHistory).toHaveBeenCalledTimes(1);
    expect(api.listJobHistory).toHaveBeenCalledWith('65ada2f9');
  });

  it('handles on back', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue(jobStatus);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});

    await actRender();
    fireEvent.click(screen.getByText('Back'));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/jobs/65ada2f9');
  });

  it('handles on run', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue(jobStatus);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});
    jest.mocked(api.patchJobStatus).mockResolvedValue();

    await actRender();
    expect(api.retrieveJob).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Run'));
    });

    expect(api.patchJobStatus).toHaveBeenCalledTimes(1);
    expect(api.patchJobStatus).toHaveBeenCalledWith('65ada2f9', {
      running: true,
      etag: '"1n9er1hz749r"',
    });
    expect(api.retrieveJobStatus).toHaveBeenCalledTimes(2);
    expect(api.retrieveJobStatus).toHaveBeenCalledWith('65ada2f9');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles on run patch job status error', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue(jobStatus);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});
    jest.mocked(api.patchJobStatus).mockRejectedValue(new Error('Unexpected'));

    await actRender();
    expect(api.retrieveJob).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Run'));
    });

    expect(api.patchJobStatus).toHaveBeenCalledTimes(1);
    expect(api.patchJobStatus).toHaveBeenCalledWith('65ada2f9', {
      running: true,
      etag: '"1n9er1hz749r"',
    });
    expect(api.retrieveJobStatus).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('handles on run retrieve job status error', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockResolvedValueOnce(jobStatus);
    jest
      .mocked(api.retrieveJobStatus)
      .mockRejectedValue(new Error('Unexpected'));
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});
    jest.mocked(api.patchJobStatus).mockResolvedValue();

    await actRender();
    expect(api.retrieveJob).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Run'));
    });

    expect(api.patchJobStatus).toHaveBeenCalledTimes(1);
    expect(api.patchJobStatus).toHaveBeenCalledWith('65ada2f9', {
      running: true,
      etag: '"1n9er1hz749r"',
    });
    expect(api.retrieveJobStatus).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('handles on delete', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue(jobStatus);
    jest
      .mocked(api.listJobHistory)
      .mockResolvedValue({items: [{} as JobHistory]});
    jest.mocked(api.deleteJobHistory).mockResolvedValue();

    await actRender();
    expect(api.retrieveJob).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => expect(api.deleteJobHistory).toHaveBeenCalledTimes(1));
    expect(api.deleteJobHistory).toHaveBeenCalledWith(
      '65ada2f9',
      '"1n9er1hz749r"',
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/jobs/65ada2f9');
  });

  it('handles on delete error', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue(jobStatus);
    jest
      .mocked(api.listJobHistory)
      .mockResolvedValue({items: [{} as JobHistory]});
    jest
      .mocked(api.deleteJobHistory)
      .mockRejectedValue(new Error('Unexpected'));

    await actRender();
    expect(api.retrieveJob).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteJobHistory).toHaveBeenCalledTimes(1);
    expect(api.deleteJobHistory).toHaveBeenCalledWith(
      '65ada2f9',
      '"1n9er1hz749r"',
    );
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });
});

const actRender = () =>
  act(async () => {
    render(
      <Router initialEntries={['/jobs/65ada2f9/history']}>
        <Routes>
          <Route path="/jobs/:id/history" element={<JobHistoryPage />} />
        </Routes>
      </Router>,
    );
  });
