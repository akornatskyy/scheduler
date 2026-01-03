import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import {CollectionItem, JobInput} from '../types';
import {JobForm} from './JobForm';

describe('JobForm', () => {
  let draft: JobInput;
  const collections: CollectionItem[] = [
    {id: '65ada2f9', name: 'My App #1', state: 'disabled'},
    {id: '7d76cb30', name: 'My Other App', state: 'enabled'},
  ];
  let props: Parameters<typeof JobForm>[0];

  beforeEach(() => {
    props = {
      item: {
        id: '',
        collectionId: '',
        name: '',
        state: 'enabled',
        schedule: '',
        action: {
          type: 'HTTP',
          request: {method: 'GET', uri: '', headers: [], body: ''},
          retryPolicy: {deadline: '', retryCount: 0, retryInterval: ''},
        },
      },
      collections,
      pending: false,
      errors: {},
      mutate: jest.fn((recipe) => recipe(draft)),
      onSave: jest.fn(),
      onDelete: jest.fn(),
    };
    draft = JSON.parse(JSON.stringify(props.item));
  });

  it('renders add item', () => {
    render(<JobForm {...props} />);

    expect(screen.getByText('Save')).toBeEnabled();
    expect(screen.queryByText('History')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('renders edit item', () => {
    render(
      <Router>
        <JobForm {...props} item={{...props.item, id: '123de331'}} />
      </Router>,
    );

    expect(screen.getByText('Save')).toBeEnabled();
    expect(screen.getByText('History')).toBeEnabled();
    expect(screen.getByText('Delete')).toBeEnabled();
  });

  it('renders add item without Router', () => {
    render(<JobForm {...props} item={{...props.item, id: ''}} />);

    expect(screen.getByText('Save')).toBeEnabled();
    expect(screen.queryByText('History')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('calls item mutate callback', () => {
    const mutate = jest.mocked(props.mutate);
    const {rerender} = render(<JobForm {...props} />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value: 'My Job',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.name).toBe('My Job');

    mutate.mockClear();
    fireEvent.change(screen.getByLabelText('Collection'), {
      target: {
        value: '7d76cb30',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.collectionId).toBe('7d76cb30');

    mutate.mockClear();
    fireEvent.click(screen.getByLabelText('Disabled'));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.state).toBe('disabled');

    mutate.mockClear();
    fireEvent.change(
      screen.getByLabelText((content) => content.startsWith('Schedule')),
      {
        target: {
          value: '@every 5m',
        },
      },
    );
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.schedule).toBe('@every 5m');

    props.item.state = 'disabled';
    rerender(<JobForm {...props} />);

    mutate.mockClear();
    fireEvent.click(screen.getByLabelText('Enabled'));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.state).toBe('enabled');
  });

  it('calls request mutate callback', () => {
    const mutate = jest.mocked(props.mutate);
    const {rerender} = render(<JobForm {...props} />);

    mutate.mockClear();
    fireEvent.change(screen.getByLabelText('Method'), {
      target: {
        value: 'PUT',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.action.request.method).toBe('PUT');

    mutate.mockClear();
    fireEvent.change(screen.getByLabelText('URI'), {
      target: {
        value: 'https://localhost',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.action.request.uri).toBe('https://localhost');

    expect(screen.queryByLabelText('Body')).toBeNull();

    props.item.action.request.method = 'POST';
    rerender(<JobForm {...props} />);

    mutate.mockClear();
    fireEvent.change(screen.getByLabelText('Body'), {
      target: {
        value: '{}',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.action.request.body).toBe('{}');
  });

  it('calls headers mutate callback', () => {
    const mutate = jest.mocked(props.mutate);
    const {rerender} = render(<JobForm {...props} />);

    mutate.mockClear();
    fireEvent.click(screen.getByRole('button', {name: 'Add Header'}));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.action.request.headers).toEqual([{name: '', value: ''}]);

    props.item.action.request.headers = [
      {name: 'Content-Type', value: 'application/json'},
    ];
    draft = JSON.parse(JSON.stringify(props.item));
    rerender(<JobForm {...props} />);

    mutate.mockClear();
    fireEvent.change(screen.getByRole('textbox', {name: 'Header Name'}), {
      target: {
        value: 'X-Requested-With',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.action.request.headers[0].name).toBe('X-Requested-With');

    mutate.mockClear();
    fireEvent.change(screen.getByRole('textbox', {name: 'Header Value'}), {
      target: {
        value: 'XMLHttpRequest',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.action.request.headers[0].value).toBe('XMLHttpRequest');

    mutate.mockClear();
    fireEvent.click(screen.getByRole('button', {name: 'Remove Header'}));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.action.request.headers).toHaveLength(0);
  });

  it('calls policy mutate callback', () => {
    const mutate = jest.mocked(props.mutate);
    render(<JobForm {...props} />);

    mutate.mockClear();
    fireEvent.change(screen.getByLabelText('Retry Count'), {
      target: {
        value: '7',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.action.retryPolicy.retryCount).toBe(7);

    mutate.mockClear();
    fireEvent.change(screen.getByLabelText('Interval'), {
      target: {
        value: '45s',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.action.retryPolicy.retryInterval).toBe('45s');

    mutate.mockClear();
    fireEvent.change(screen.getByLabelText('Deadline'), {
      target: {
        value: '3m',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.action.retryPolicy.deadline).toBe('3m');
  });

  it('renders edit item', () => {
    props.item = {
      id: '7ce1f17e',
      name: 'My Task #1',
      state: 'disabled',
      collectionId: '7d76cb30',
      schedule: '@every 1h',
      action: {
        type: 'HTTP',
        request: {
          method: 'GET',
          uri: 'http://example.com',
          headers: [{name: 'X-Requested-With', value: 'XMLHttpRequest'}],
          body: '',
        },
        retryPolicy: {retryCount: 3, retryInterval: '10s', deadline: '1m'},
      },
    };

    render(
      <Router>
        <JobForm {...props} />
      </Router>,
    );

    expect(screen.getByLabelText('Name')).toHaveValue('My Task #1');
    expect(screen.getByLabelText('Disabled')).toBeChecked();
    expect(screen.getByLabelText('Collection')).toHaveDisplayValue(
      'My Other App',
    );
    expect(
      screen.getByLabelText((component) => component.startsWith('Schedule')),
    ).toHaveValue('@every 1h');
    expect(screen.getByLabelText('Action')).toHaveValue('HTTP');
    expect(screen.getByLabelText('Method')).toHaveValue('GET');
    expect(screen.getByLabelText('URI')).toHaveValue('http://example.com');
    expect(screen.getAllByPlaceholderText('Name')[1]).toHaveValue(
      'X-Requested-With',
    );
    expect(screen.getByPlaceholderText('Value')).toHaveValue('XMLHttpRequest');
    expect(screen.getByLabelText('Retry Count')).toHaveValue(3);
    expect(screen.getByLabelText('Interval')).toHaveValue('10s');
    expect(screen.getByLabelText('Deadline')).toHaveValue('1m');
  });

  it('calls on save callback', () => {
    const handler = jest.mocked(props.onSave);
    render(<JobForm {...props} />);

    fireEvent.submit(screen.getByText('Save'));

    expect(handler).toHaveBeenCalledWith();
  });

  it('calls on delete callback', () => {
    props.item.id = '65ada2f9';
    const handler = jest.mocked(props.onDelete);
    render(
      <Router>
        <JobForm {...props} />
      </Router>,
    );

    fireEvent.click(screen.getByText('Delete'));

    expect(handler).toHaveBeenCalled();
  });

  it('renders no errors', () => {
    const {container} = render(<JobForm {...props} />);

    expect(container.querySelectorAll('.is-invalid')).toHaveLength(0);
    expect(container.querySelectorAll('.invalid-feedback')).toHaveLength(0);
  });

  it('renders all errors', () => {
    props.item.action.request.method = 'POST';
    const errors: Record<string, string> = {
      name: 'An error related to name.',
      state: 'An error related to state.',
      collectionId: 'An error related to collectionId.',
      type: 'An error related to type.',
      schedule: 'An error related to schedule.',
      method: 'An error related to method.',
      uri: 'An error related to uri.',
      body: 'An error related to body.',
      retryCount: 'An error related to retryCount.',
      retryInterval: 'An error related to retryInterval.',
      deadline: 'An error related to deadline.',
    };

    const {container} = render(<JobForm {...props} errors={errors} />);

    expect(container.querySelectorAll('.is-invalid')).toHaveLength(12);
    expect(container.querySelectorAll('.invalid-feedback')).toHaveLength(11);
    for (const error of Object.values(props.errors)) {
      expect(screen.getByText(error)).toBeVisible();
    }
  });
});
