import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';

import Job from './job';
import * as api from './job-api';

jest.mock('./job-api');

describe('job', () => {
  const sampleJob = {
    id: '7ce1f17e',
    name: 'My Job #1',
    state: 'disabled',
    schedule: 'every 5m',
    collectionId: '65ada2f9',
    action: {
      type: 'HTTP',
      request: {
        method: 'POST',
        uri: 'http://localhost:8080',
        headers: [{name: '', value: ''}],
        body: '{}',
      },
      retryPolicy: {
        retryCount: 2,
        retryInterval: '30s',
        deadline: '2m',
      },
    },
  };
  let props = null;

  beforeEach(() => {
    props = {
      match: {params: {id: '7ce1f17e'}},
      history: {
        goBack: jest.fn(),
      },
    };
    api.listCollections.mockResolvedValue({
      items: [
        {
          id: '65ada2f9',
          name: 'My App #1',
          state: 'enabled',
        },
        {
          id: '123de331',
          name: 'My App #2',
          state: 'disabled',
        },
      ],
    });
    jest.clearAllMocks();
  });

  it('renders add item if no id specified', async () => {
    props.match.params.id = null;
    await act(async () => {
      render(<Job {...props} />);
    });

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
  });

  it('renders edit item', async () => {
    api.retrieveJob.mockResolvedValue(sampleJob);

    await act(async () => {
      render(
        <Router>
          <Job {...props} />
        </Router>,
      );
    });

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(api.retrieveJob).toBeCalledWith('7ce1f17e');

    await act(async () => {
      expect(screen.getByText('Delete')).toBeVisible();
    });
  });

  it('shows field error when collections list is empty', async () => {
    props.match.params.id = null;
    api.listCollections.mockResolvedValue({items: []});

    await act(async () => {
      render(<Job {...props} />);
    });

    expect(screen.getByText('There is no collection available.')).toBeVisible();
  });

  it('selects a first item from collections list', async () => {
    props.match.params.id = null;
    api.listCollections.mockResolvedValue({
      items: [
        {
          id: '84432333',
          name: 'My App',
          state: 'enabled',
        },
        {
          id: '65ada2f9',
          name: 'My Other App',
          state: 'enabled',
        },
      ],
    });

    await act(async () => {
      render(<Job {...props} />);
    });

    expect(screen.getByLabelText('Collection')).toHaveValue('84432333');
  });

  it('list collections fails', async () => {
    props.match.params.id = null;
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockRejectedValue(errors);

    await act(async () => {
      render(<Job {...props} />);
    });

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles retrieve job error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveJob.mockRejectedValue(errors);

    await act(async () => {
      render(<Job {...props} />);
    });

    expect(api.retrieveJob).toBeCalledTimes(1);
    expect(api.retrieveJob).toBeCalledWith('7ce1f17e');
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles item change', async () => {
    await act(async () => {
      render(<Job {...props} />);
    });
    expect(api.listCollections).toBeCalledTimes(1);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value: 'My Other Task',
      },
    });
    fireEvent.click(screen.getByLabelText('Disabled'));
    fireEvent.change(screen.getByLabelText('Collection'), {
      target: {
        value: '123de331',
      },
    });
    fireEvent.change(
      screen.getByLabelText((component) => component.startsWith('Schedule')),
      {
        target: {
          value: '@every 15s',
        },
      },
    );

    expect(screen.getByRole('form')).toHaveFormValues({
      name: 'My Other Task',
      state: 'disabled',
      collectionId: '123de331',
      schedule: '@every 15s',
    });
  });

  it('handles action change', async () => {
    await act(async () => {
      render(<Job {...props} />);
    });

    fireEvent.change(screen.getByLabelText('Action'), {
      target: {
        value: 'HTTP',
      },
    });

    expect(screen.getByRole('form')).toHaveFormValues({
      type: 'HTTP',
    });
  });

  it('handles request change', async () => {
    await act(async () => {
      render(<Job {...props} />);
    });

    fireEvent.change(screen.getByLabelText('Method'), {
      target: {
        value: 'POST',
      },
    });
    fireEvent.change(screen.getByLabelText('URI'), {
      target: {
        value: 'http://localhost',
      },
    });
    fireEvent.change(screen.getByLabelText('Body'), {
      target: {
        value: '{}',
      },
    });

    expect(screen.getByRole('form')).toHaveFormValues({
      method: 'POST',
      uri: 'http://localhost',
      body: '{}',
    });
  });

  it('handles policy change', async () => {
    await act(async () => {
      render(<Job {...props} />);
    });

    fireEvent.change(screen.getByLabelText('Retry Count'), {
      target: {
        value: '7',
      },
    });
    fireEvent.change(screen.getByLabelText('Interval'), {
      target: {
        value: '45s',
      },
    });
    fireEvent.change(screen.getByLabelText('Deadline'), {
      target: {
        value: '3m',
      },
    });

    expect(screen.getByRole('form')).toHaveFormValues({
      retryCount: 7,
      retryInterval: '45s',
      deadline: '3m',
    });
  });

  it('handles add header', async () => {
    await act(async () => {
      render(<Job {...props} />);
    });
    expect(api.listCollections).toBeCalledTimes(1);

    // Add header
    fireEvent.click(screen.getByRole('button', {name: ''}));

    expect(screen.getByRole('form')).toHaveFormValues({
      name: ['', ''],
      value: '',
    });
  });

  it('handles delete header', async () => {
    await act(async () => {
      render(<Job {...props} />);
    });
    expect(api.listCollections).toBeCalledTimes(1);
    // Add header
    fireEvent.click(screen.getByRole('button', {name: ''}));
    expect(screen.getByPlaceholderText('Value')).toBeVisible();

    // Delete header
    fireEvent.click(
      screen.getByRole(
        (content, element) =>
          content === 'button' && element.querySelector('i.fa-times'),
      ),
    );

    expect(screen.queryByPlaceholderText('Value')).not.toBeInTheDocument();
  });

  it('handles header change', async () => {
    await act(async () => {
      render(<Job {...props} />);
    });
    expect(api.listCollections).toBeCalledTimes(1);
    // Add header
    fireEvent.click(screen.getByRole('button', {name: ''}));
    fireEvent.change(screen.getAllByPlaceholderText('Name')[1], {
      target: {
        value: 'X-Requested-With',
      },
    });
    fireEvent.change(screen.getByPlaceholderText('Value'), {
      target: {
        value: 'XMLHttpRequest',
      },
    });

    expect(screen.getByRole('form')).toHaveFormValues({
      name: ['', 'X-Requested-With'],
      value: 'XMLHttpRequest',
    });
  });

  it('saves item', async () => {
    props.match.params.id = null;
    api.saveJob.mockResolvedValue();
    await act(async () => {
      render(<Job {...props} />);
    });
    expect(api.listCollections).toBeCalledTimes(1);

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveJob).toBeCalledWith({
      name: '',
      state: 'enabled',
      collectionId: '65ada2f9',
      schedule: '',
      action: {
        type: 'HTTP',
        request: {
          method: 'GET',
          uri: '',
          headers: [],
          body: '',
        },
        retryPolicy: {
          retryCount: 3,
          retryInterval: '10s',
          deadline: '1m',
        },
      },
    });
    expect(props.history.goBack.mock.calls.length).toBe(1);
  });

  it('handles save errors', async () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    api.saveJob.mockRejectedValue(errors);
    await act(async () => {
      render(<Job {...props} />);
    });
    expect(api.listCollections).toBeCalledTimes(1);

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveJob).toBeCalled();
    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(screen.getByText(errors.name)).toBeVisible();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('deletes item', async () => {
    api.retrieveJob.mockResolvedValue({
      etag: '"2hhaswzbz72p8"',
      ...sampleJob,
    });
    api.deleteJob.mockResolvedValue();
    await act(async () => {
      render(
        <Router>
          <Job {...props} />
        </Router>,
      );
    });
    expect(api.retrieveJob).toBeCalledWith('7ce1f17e');

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteJob).toBeCalledWith('7ce1f17e', '"2hhaswzbz72p8"');
    expect(props.history.goBack.mock.calls.length).toBe(1);
  });

  it('handles delete errors', async () => {
    api.retrieveJob.mockResolvedValue(sampleJob);
    const errors = {__ERROR__: 'The error text.'};
    api.deleteJob.mockRejectedValue(errors);
    await act(async () => {
      render(
        <Router>
          <Job {...props} />
        </Router>,
      );
    });
    expect(api.retrieveJob).toBeCalledWith('7ce1f17e');

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteJob).toBeCalledWith('7ce1f17e', undefined);
    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });
});
