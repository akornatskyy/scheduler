import React from 'react';
import {MemoryRouter as Router} from 'react-router-dom';
import {render, screen, fireEvent} from '@testing-library/react';

import {CollectionForm} from './collection-components';

describe('collection form component', () => {
  let props = null;

  beforeEach(() => {
    props = {
      item: {
        name: 'My App',
        state: 'disabled',
      },
      pending: false,
      errors: {},
    };
  });

  it('renders add item', () => {
    render(<CollectionForm {...props} />);

    expect(screen.getByRole('form')).toHaveFormValues(props.item);
    expect(screen.getByText('Save')).toBeEnabled();
    expect(screen.queryByText('Variables')).not.toBeInTheDocument();
    expect(screen.queryByText('Jobs')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('renders edit item', () => {
    render(
      <Router>
        <CollectionForm {...props} item={{...props.item, id: '65ada2f9'}} />
      </Router>,
    );

    expect(screen.getByRole('form')).toHaveFormValues(props.item);
    expect(screen.getByText('Save')).toBeEnabled();
    expect(screen.getByText('Variables')).toBeEnabled();
    expect(screen.getByText('Jobs')).toBeEnabled();
    expect(screen.getByText('Delete')).toBeEnabled();
  });

  it('calls on change callback', () => {
    const handler = jest.fn();
    render(<CollectionForm {...props} onChange={handler} />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value: 'My Other App',
      },
    });
    expect(handler).toHaveBeenCalledTimes(1);

    handler.mockClear();
    fireEvent.click(screen.getByLabelText('Enabled'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls on save callback', () => {
    const handler = jest.fn();
    render(<CollectionForm {...props} onSave={handler} />);

    fireEvent.submit(screen.getByText('Save'));

    expect(handler).toHaveBeenCalledWith();
  });

  it('calls on delete callback', () => {
    props.item.id = '65ada2f9';
    const handler = jest.fn();
    render(
      <Router>
        <CollectionForm {...props} onDelete={handler} />
      </Router>,
    );

    fireEvent.click(screen.getByText('Delete'));

    expect(handler).toHaveBeenCalled();
  });

  it('handles undefined callbacks', () => {
    props.item.id = '65ada2f9';
    render(
      <Router>
        <CollectionForm {...props} />
      </Router>,
    );

    fireEvent.change(screen.getByLabelText('Name'));
    fireEvent.click(screen.getByText('Save'));
    fireEvent.click(screen.getByText('Delete'));
  });

  it('renders no errors', () => {
    const {container} = render(<CollectionForm {...props} />);

    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(0);
  });

  it('renders all errors', () => {
    const errors = {
      name: 'An error related to name.',
      state: 'An error related to state.',
    };

    render(<CollectionForm {...props} errors={errors} />);

    for (const name of Object.getOwnPropertyNames(errors)) {
      expect(screen.getByText(errors[name])).toBeVisible();
    }
  });
});
