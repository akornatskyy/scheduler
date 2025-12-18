import {act, fireEvent, render, screen} from '@testing-library/react';
import {Route, MemoryRouter as Router, Routes} from 'react-router';
import JobContainer from './job';
import * as api from './job-api';
import {JobDefinition} from './types';
import {ValidationError} from '$shared/errors';

jest.mock('./job-api');

const mockNavigate = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('job container', () => {
  const sampleJob: JobDefinition = {
    id: '7ce1f17e',
    name: 'My Job #1',
    state: 'disabled',
    schedule: 'every 5m',
    collectionId: '65ada2f9',
    status: 'ready',
    errorRate: 0,
    updated: '2025-01-01T00:00:00Z',
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
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(api.listCollections).mockResolvedValue({
      items: [
        {id: '65ada2f9', name: 'My App #1', state: 'enabled'},
        {id: '123de331', name: 'My App #2', state: 'disabled'},
      ],
    });
  });

  it('renders add item if no id specified', async () => {
    await actRenderAdd();

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
  });

  it('renders edit item', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(sampleJob);

    await actRenderEdit();

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(api.retrieveJob).toHaveBeenCalledWith('7ce1f17e');

    await act(async () => {
      expect(screen.getByText('Delete')).toBeVisible();
    });
  });

  it('shows field error when collections list is empty', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({items: []});

    await actRenderAdd();

    expect(screen.getByRole('combobox', {name: 'Collection'})).toHaveClass(
      'is-invalid',
    );
    expect(screen.getByText('There is no collection available.')).toBeVisible();
  });

  it('selects a first item from collections list', async () => {
    await actRenderAdd();

    expect(screen.getByLabelText('Collection')).toHaveValue('65ada2f9');
  });

  it('list collections fails', async () => {
    jest.mocked(api.listCollections).mockRejectedValue(new Error('Unexpected'));

    await actRenderAdd();

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('handles retrieve job error', async () => {
    jest.mocked(api.retrieveJob).mockRejectedValue(new Error('Unexpected'));

    await actRenderEdit();

    expect(api.retrieveJob).toHaveBeenCalledTimes(1);
    expect(api.retrieveJob).toHaveBeenCalledWith('7ce1f17e');
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
  });

  it('handles item change', async () => {
    await actRenderAdd();

    expect(api.listCollections).toHaveBeenCalledTimes(1);

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
      state: 'disabled' as const,
      collectionId: '123de331',
      schedule: '@every 15s',
    });
  });

  it('handles action change', async () => {
    await actRenderEdit();

    fireEvent.change(screen.getByLabelText('Action'), {
      target: {
        value: 'HTTP',
      },
    });

    expect(screen.getByRole('form')).toHaveFormValues({
      type: 'HTTP' as const,
    });
  });

  it('handles request change', async () => {
    await actRenderEdit();

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
    await actRenderEdit();

    fireEvent.change(screen.getByLabelText('Retry Count'), {
      target: {value: '7'},
    });
    fireEvent.change(screen.getByLabelText('Interval'), {
      target: {value: '45s'},
    });
    fireEvent.change(screen.getByLabelText('Deadline'), {
      target: {value: '3m'},
    });

    expect(screen.getByRole('form')).toHaveFormValues({
      retryCount: 7,
      retryInterval: '45s',
      deadline: '3m',
    });
  });

  it('handles add header', async () => {
    await actRenderAdd();

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    // Add header
    fireEvent.click(screen.getByRole('button', {name: ''}));

    expect(screen.getByRole('form')).toHaveFormValues({
      name: ['', ''],
      value: '',
    });
  });

  it('handles delete header', async () => {
    await actRenderAdd();

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    // Add header
    fireEvent.click(screen.getByRole('button', {name: ''}));
    expect(screen.getByPlaceholderText('Value')).toBeVisible();

    // Delete header
    fireEvent.click(
      screen.getByText(
        (_, element) =>
          !!(
            element &&
            (element as HTMLButtonElement).type === 'button' &&
            element.querySelector('i.fa-times')
          ),
      ),
    );

    expect(screen.queryByPlaceholderText('Value')).not.toBeInTheDocument();
  });

  it('handles header change', async () => {
    await actRenderAdd();

    expect(api.listCollections).toHaveBeenCalledTimes(1);
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
    jest.mocked(api.saveJob).mockResolvedValue();
    await actRenderAdd();

    expect(api.listCollections).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveJob).toHaveBeenCalledWith({
      name: '',
      state: 'enabled',
      collectionId: '65ada2f9',
      schedule: '',
      action: {
        type: 'HTTP' as const,
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
    expect(api.saveJob).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/jobs');
  });

  it('handles save errors', async () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest.mocked(api.saveJob).mockRejectedValue(new ValidationError(errors));

    const {container} = await actRenderAdd();
    expect(api.listCollections).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveJob).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', {name: /The error text/})).toBeVisible();
    expect(screen.getByRole('textbox', {name: 'Name'})).toHaveClass(
      'is-invalid',
    );
    expect(screen.getByText(errors.name)).toBeVisible();
    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(1);
  });

  it('deletes item', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue({
      etag: '"2hhaswzbz72p8"',
      ...sampleJob,
    });
    jest.mocked(api.deleteJob).mockResolvedValue();

    await actRenderEdit();

    expect(api.retrieveJob).toHaveBeenCalledWith('7ce1f17e');

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteJob).toHaveBeenCalledWith('7ce1f17e', '"2hhaswzbz72p8"');
    expect(api.deleteJob).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/jobs', {replace: true});
  });

  it('handles delete errors', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(sampleJob);
    jest.mocked(api.deleteJob).mockRejectedValue(new Error('The error text.'));

    await actRenderEdit();

    expect(api.retrieveJob).toHaveBeenCalledWith('7ce1f17e');

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteJob).toHaveBeenCalledWith('7ce1f17e', undefined);
    expect(screen.getByRole('heading', {name: /The error text/})).toBeVisible();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

const actRenderAdd = () =>
  act(async () =>
    render(
      <Router initialEntries={['/jobs/add']}>
        <Routes>
          <Route path="/jobs/add" element={<JobContainer />} />
        </Routes>
      </Router>,
    ),
  );

const actRenderEdit = () =>
  act(async () =>
    render(
      <Router initialEntries={['/jobs/7ce1f17e']}>
        <Routes>
          <Route path="/jobs/:id" element={<JobContainer />} />
        </Routes>
      </Router>,
    ),
  );
