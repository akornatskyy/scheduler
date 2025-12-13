import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Route, MemoryRouter as Router, Routes} from 'react-router-dom';
import {default as JobHistoryContainer} from './history';
import * as api from './history-api';
import {JobHistory, JobStatus} from './types';

jest.mock('./history-api');

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('job history container', () => {
  const job = {name: 'My Task'} as Awaited<ReturnType<typeof api.retrieveJob>>;
  const jobStatus = {etag: '"1n9er1hz749r"'} as JobStatus;

  const goBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockImplementationOnce(goBack);
  });

  it('handles retrieve job error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.retrieveJob).mockRejectedValue(errors);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue(jobStatus);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});

    await actRender();

    expect(api.retrieveJob).toHaveBeenCalledTimes(1);
    expect(api.retrieveJob).toHaveBeenCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toHaveBeenCalledTimes(1);
    expect(api.retrieveJobStatus).toHaveBeenCalledWith('65ada2f9');
    expect(api.listJobHistory).toHaveBeenCalledTimes(1);
    expect(api.listJobHistory).toHaveBeenCalledWith('65ada2f9');
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles retrieve job status error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockRejectedValue(errors);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});

    await actRender();

    expect(api.retrieveJob).toHaveBeenCalledTimes(1);
    expect(api.retrieveJob).toHaveBeenCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toHaveBeenCalledTimes(1);
    expect(api.retrieveJobStatus).toHaveBeenCalledWith('65ada2f9');
    expect(api.listJobHistory).toHaveBeenCalledTimes(1);
    expect(api.listJobHistory).toHaveBeenCalledWith('65ada2f9');
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles list job history error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue(jobStatus);
    jest.mocked(api.listJobHistory).mockRejectedValue(errors);

    await actRender();

    expect(api.retrieveJob).toHaveBeenCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toHaveBeenCalledTimes(1);
    expect(api.retrieveJobStatus).toHaveBeenCalledWith('65ada2f9');
    expect(api.listJobHistory).toHaveBeenCalledTimes(1);
    expect(api.listJobHistory).toHaveBeenCalledWith('65ada2f9');
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
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
    expect(goBack).toHaveBeenCalledTimes(1);
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
    expect(goBack).not.toHaveBeenCalled();
  });

  it('handles on run patch job status error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue(jobStatus);
    jest.mocked(api.listJobHistory).mockResolvedValue({items: []});
    jest.mocked(api.patchJobStatus).mockRejectedValue(errors);

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
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles on run retrieve job status error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockResolvedValueOnce(jobStatus);
    jest.mocked(api.retrieveJobStatus).mockRejectedValue(errors);
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
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
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
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('handles on delete error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.retrieveJobStatus).mockResolvedValue(jobStatus);
    jest
      .mocked(api.listJobHistory)
      .mockResolvedValue({items: [{} as JobHistory]});
    jest.mocked(api.deleteJobHistory).mockRejectedValue(errors);

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
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });
});

const actRender = () =>
  act(async () => {
    render(
      <Router initialEntries={['/jobs/65ada2f9/history']}>
        <Routes>
          <Route path="/jobs/:id/history" element={<JobHistoryContainer />} />
        </Routes>
      </Router>,
    );
  });
