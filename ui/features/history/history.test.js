import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import JobHistory from './history';
import * as api from './history-api';

jest.mock('./history-api');

describe('job history', () => {
  let props = null;

  beforeEach(() => {
    props = {
      match: {params: {id: '65ada2f9'}},
      history: {
        goBack: jest.fn(),
      },
    };
    jest.clearAllMocks();
  });

  it('handles retrieve job error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockRejectedValue(errors);
    api.retrieveJobStatus.mockResolvedValue({});
    api.listJobHistory.mockResolvedValue({items: []});

    await act(async () => {
      render(<JobHistory {...props} />);
    });

    expect(api.retrieveJob).toBeCalledTimes(1);
    expect(api.retrieveJob).toBeCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toBeCalledTimes(1);
    expect(api.retrieveJobStatus).toBeCalledWith('65ada2f9');
    expect(api.listJobHistory).toBeCalledTimes(1);
    expect(api.listJobHistory).toBeCalledWith('65ada2f9');
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles retrieve job status error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockResolvedValue({});
    api.retrieveJobStatus.mockRejectedValue(errors);
    api.listJobHistory.mockResolvedValue({items: []});

    await act(async () => {
      render(<JobHistory {...props} />);
    });

    expect(api.retrieveJob).toBeCalledTimes(1);
    expect(api.retrieveJob).toBeCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toBeCalledTimes(1);
    expect(api.retrieveJobStatus).toBeCalledWith('65ada2f9');
    expect(api.listJobHistory).toBeCalledTimes(1);
    expect(api.listJobHistory).toBeCalledWith('65ada2f9');
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles list job history error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockResolvedValue({});
    api.retrieveJobStatus.mockResolvedValue({});
    api.listJobHistory.mockRejectedValue(errors);

    await act(async () => {
      render(<JobHistory {...props} />);
    });

    expect(api.retrieveJob).toBeCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toBeCalledTimes(1);
    expect(api.retrieveJobStatus).toBeCalledWith('65ada2f9');
    expect(api.listJobHistory).toBeCalledTimes(1);
    expect(api.listJobHistory).toBeCalledWith('65ada2f9');
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('updates state with fetched items', async () => {
    const job = {name: 'My Task'};
    const status = {running: true};
    const items = [];
    api.retrieveJob.mockResolvedValue(job);
    api.retrieveJobStatus.mockResolvedValue(status);
    api.listJobHistory.mockResolvedValue({items});

    await act(async () => {
      render(<JobHistory {...props} />);
    });

    expect(api.retrieveJob).toBeCalledTimes(1);
    expect(api.retrieveJob).toBeCalledWith('65ada2f9');
    expect(api.retrieveJobStatus).toBeCalledTimes(1);
    expect(api.retrieveJobStatus).toBeCalledWith('65ada2f9');
    expect(api.listJobHistory).toBeCalledTimes(1);
    expect(api.listJobHistory).toBeCalledWith('65ada2f9');
  });

  it('handles on back', async () => {
    api.retrieveJob.mockResolvedValue({});
    api.retrieveJobStatus.mockResolvedValue({});
    api.listJobHistory.mockResolvedValue({items: []});
    await act(async () => {
      render(<JobHistory {...props} />);
    });

    fireEvent.click(screen.getByText('Back'));

    expect(props.history.goBack).toBeCalledTimes(1);
  });

  it('handles on run', async () => {
    const status = {etag: '"1n9er1hz749r"'};
    api.retrieveJob.mockResolvedValue({});
    api.retrieveJobStatus.mockResolvedValue(status);
    api.listJobHistory.mockResolvedValue({items: []});
    api.patchJobStatus.mockResolvedValue();
    await act(async () => {
      render(<JobHistory {...props} />);
    });
    expect(api.retrieveJob).toBeCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Run'));
    });

    expect(api.patchJobStatus).toBeCalledTimes(1);
    expect(api.patchJobStatus).toBeCalledWith('65ada2f9', {
      running: true,
      etag: '"1n9er1hz749r"',
    });
    expect(api.retrieveJobStatus).toBeCalledTimes(2);
    expect(api.retrieveJobStatus).toBeCalledWith('65ada2f9');
  });

  it('handles on run patch job status error', async () => {
    const status = {etag: '"1n9er1hz749r"'};
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockResolvedValue({});
    api.retrieveJobStatus.mockResolvedValue(status);
    api.listJobHistory.mockResolvedValue({items: []});
    api.patchJobStatus.mockRejectedValue(errors);
    await act(async () => {
      render(<JobHistory {...props} />);
    });
    expect(api.retrieveJob).toBeCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Run'));
    });

    expect(api.patchJobStatus).toBeCalledTimes(1);
    expect(api.patchJobStatus).toBeCalledWith('65ada2f9', {
      running: true,
      etag: '"1n9er1hz749r"',
    });
    expect(api.retrieveJobStatus).toBeCalledTimes(1);
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles on run retrieve job status error', async () => {
    const status = {etag: '"1n9er1hz749r"'};
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockResolvedValue({});
    api.retrieveJobStatus.mockResolvedValueOnce(status);
    api.retrieveJobStatus.mockRejectedValue(errors);
    api.listJobHistory.mockResolvedValue({items: []});
    api.patchJobStatus.mockResolvedValue();
    await act(async () => {
      render(<JobHistory {...props} />);
    });
    expect(api.retrieveJob).toBeCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Run'));
    });

    expect(api.patchJobStatus).toBeCalledTimes(1);
    expect(api.patchJobStatus).toBeCalledWith('65ada2f9', {
      running: true,
      etag: '"1n9er1hz749r"',
    });
    expect(api.retrieveJobStatus).toBeCalledTimes(2);
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles on delete', async () => {
    const status = {etag: '"1n9er1hz749r"'};
    api.retrieveJob.mockResolvedValue({});
    api.retrieveJobStatus.mockResolvedValue(status);
    api.listJobHistory.mockResolvedValue({items: [{}]});
    api.deleteJobHistory.mockResolvedValue();
    await act(async () => {
      render(<JobHistory {...props} />);
    });
    expect(api.retrieveJob).toBeCalled();

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => expect(api.deleteJobHistory).toBeCalledTimes(1));
    expect(api.deleteJobHistory).toBeCalledWith('65ada2f9', '"1n9er1hz749r"');
  });

  it('handles on delete error', async () => {
    const status = {etag: '"1n9er1hz749r"'};
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockResolvedValue({});
    api.retrieveJobStatus.mockResolvedValue(status);
    api.listJobHistory.mockResolvedValue({items: [{}]});
    api.deleteJobHistory.mockRejectedValue(errors);
    await act(async () => {
      render(<JobHistory {...props} />);
    });
    expect(api.retrieveJob).toBeCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteJobHistory).toBeCalledTimes(1);
    expect(api.deleteJobHistory).toBeCalledWith('65ada2f9', '"1n9er1hz749r"');
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });
});
