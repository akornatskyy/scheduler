import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';
import {render, screen, fireEvent} from '@testing-library/react';

import {JobForm} from './job-components';


describe('job', () => {
  const collections = [
    {id: '65ada2f9', name: 'My App #1'},
    {id: '7d76cb30', name: 'My Other App'}
  ];
  let props = null;

  beforeEach(() => {
    props = {
      item: {
        action: {
          request: {
            headers: []
          },
          retryPolicy: {}
        }
      },
      collections,
      errors: {}
    };
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
        </Router>
    );

    expect(screen.getByText('Save')).toBeEnabled();
    expect(screen.getByText('History')).toBeEnabled();
    expect(screen.getByText('Delete')).toBeEnabled();
  });

  it('calls on item change callback', () => {
    const handler = jest.fn();
    render(
        <JobForm {...props} onItemChange={handler} />
    );

    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value: 'My Job'
      }
    });
    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'name', 'My Job');

    handler.mockClear();
    fireEvent.change(screen.getByLabelText('Collection'), {
      target: {
        value: '7d76cb30'
      }
    });
    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'collectionId', '7d76cb30');

    handler.mockClear();
    fireEvent.click(screen.getByLabelText('Disabled'));
    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'state', 'disabled');

    handler.mockClear();
    fireEvent.change(
        screen.getByLabelText((content) => content.startsWith('Schedule')),
        {
          target: {
            value: '@every 5m'
          }
        }
    );
    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'schedule', '@every 5m');
  });

  it('handle action change', () => {
    const handler = jest.fn();
    render(
        <JobForm {...props} onActionChange={handler} />
    );

    fireEvent.change(screen.getByLabelText('Action'), {
      target: {
        value: 'HTTP'
      }
    });

    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'type', 'HTTP');
  });

  it('handle request change', () => {
    props.item.action.request.method = 'POST';
    const handler = jest.fn();
    render(
        <JobForm {...props} onRequestChange={handler} />
    );

    fireEvent.change(screen.getByLabelText('Method'), {
      target: {
        value: 'PUT'
      }
    });
    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'method', 'PUT');

    handler.mockClear();
    fireEvent.change(screen.getByLabelText('URI'), {
      target: {
        value: 'https://localhost'
      }
    });
    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'uri', 'https://localhost');

    handler.mockClear();
    fireEvent.change(screen.getByLabelText('Body'), {
      target: {
        value: '{}'
      }
    });
    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'body', '{}');
  });

  it('handle policy change', () => {
    const handler = jest.fn();
    render(
        <JobForm {...props} onPolicyChange={handler} />
    );

    fireEvent.change(screen.getByLabelText('Retry Count'), {
      target: {
        value: '7'
      }
    });
    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'retryCount', 7);

    handler.mockClear();
    fireEvent.change(screen.getByLabelText('Interval'), {
      target: {
        value: '45s'
      }
    });
    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'retryInterval', '45s');

    handler.mockClear();
    fireEvent.change(screen.getByLabelText('Deadline'), {
      target: {
        value: '3m'
      }
    });
    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'deadline', '3m');
  });

  it('add header', () => {
    const handler = jest.fn();
    render(<JobForm {...props} onAddHeader={handler} />);

    fireEvent.click(screen.getByRole('button', {name: ''}));

    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith();
  });

  it('delete header', () => {
    props.item.action.request.headers = [
      {
        name: 'X-Requested-With',
        value: 'XMLHttpRequest'
      }
    ];
    const handler = jest.fn();
    render(<JobForm {...props} onDeleteHeader={handler} />);

    fireEvent.click(
        screen.getByRole((content, element) =>
          content === 'button' && element.querySelector('i.fa-times') != null)
    );

    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith(0);
  });

  it('handle header change', () => {
    props.item.action.request.headers = [
      {
        name: '',
        value: ''
      }
    ];
    const handler = jest.fn();
    render(<JobForm {...props} onHeaderChange={handler} />);

    fireEvent.change(
        screen.getAllByPlaceholderText('Name')[1], {
          target: {
            value: 'X-Requested-With'
          }
        });
    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'name', 'X-Requested-With', 0);

    handler.mockClear();
    fireEvent.change(screen.getByPlaceholderText('Value'), {
      target: {
        value: 'XMLHttpRequest'
      }
    });
    expect(handler).toBeCalledTimes(1);
    expect(handler).nthCalledWith(1, 'value', 'XMLHttpRequest', 0);
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
          headers: [
            {
              name: 'X-Requested-With',
              value: 'XMLHttpRequest'
            }
          ]
        },
        retryPolicy: {
          retryCount: 3,
          retryInterval: '10s',
          deadline: '1m'
        }
      }
    };

    render(<Router><JobForm {...props} /></Router>);

    expect(screen.getByLabelText('Name')).toHaveValue('My Task #1');
    expect(screen.getByLabelText('Disabled')).toBeChecked();
    expect(screen.getByLabelText('Collection'))
        .toHaveDisplayValue('My Other App');
    expect(screen.getByLabelText(
        (component) => component.startsWith('Schedule'))
    ).toHaveValue('@every 1h');
    expect(screen.getByLabelText('Action')).toHaveValue('HTTP');
    expect(screen.getByLabelText('Method')).toHaveValue('GET');
    expect(screen.getByLabelText('URI')).toHaveValue('http://example.com');
    expect(screen.getAllByPlaceholderText('Name')[1])
        .toHaveValue('X-Requested-With');
    expect(screen.getByPlaceholderText('Value')).toHaveValue('XMLHttpRequest');
    expect(screen.getByLabelText('Retry Count')).toHaveValue(3);
    expect(screen.getByLabelText('Interval')).toHaveValue('10s');
    expect(screen.getByLabelText('Deadline')).toHaveValue('1m');
  });

  it('calls on save callback', () => {
    const handler = jest.fn();
    render(<JobForm {...props} onSave={handler} />);

    fireEvent.submit(screen.getByText('Save'));

    expect(handler).toBeCalledWith();
  });

  it('calls on delete callback', () => {
    props.item.id = '65ada2f9';
    const handler = jest.fn();
    render(<Router><JobForm {...props} onDelete={handler} /></Router>);

    fireEvent.click(screen.getByText('Delete'));

    expect(handler).toBeCalledWith();
  });

  it('handles undefined callbacks', () => {
    props.item.id = '65ada2f9';
    render(<Router><JobForm {...props} /></Router>);

    fireEvent.change(screen.getByLabelText('Name'));
    fireEvent.click(screen.getByText('Save'));
    fireEvent.click(screen.getByText('Delete'));
  });

  it('renders no errors', () => {
    const {container} = render(<JobForm {...props} />);

    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(0);
  });

  it('renders all errors', () => {
    props.item.action.request.method = 'POST';
    const errors = {
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

    render(<JobForm {...props} errors={errors} />);

    for (const name of Object.getOwnPropertyNames(errors)) {
      expect(screen.getByText(errors[name])).toBeVisible();
    }
  });
});
