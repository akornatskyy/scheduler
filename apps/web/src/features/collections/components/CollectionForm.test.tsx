import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import {CollectionInput} from '../types';
import {CollectionForm} from './CollectionForm';

describe('CollectionForm', () => {
  let draft: CollectionInput;
  let props: Parameters<typeof CollectionForm>[0];

  beforeEach(() => {
    props = {
      item: {name: 'My App', state: 'disabled'},
      pending: false,
      errors: {},
      mutate: jest.fn((recipe) => recipe(draft)),
      onSave: jest.fn(),
      onDelete: jest.fn(),
    };
    draft = JSON.parse(JSON.stringify(props.item));
  });

  it('renders add item', () => {
    render(<CollectionForm {...props} />);

    expect(screen.getByRole('button', {name: 'Save'})).toBeEnabled();
    expect(
      screen.queryByRole('button', {name: 'Variables'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Jobs'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Delete'}),
    ).not.toBeInTheDocument();
  });

  it('renders edit item', () => {
    render(
      <Router>
        <CollectionForm {...props} id="65ada2f9" />
      </Router>,
    );

    expect(screen.getByRole('form')).toHaveFormValues(props.item);
    expect(screen.getByText('Save')).toBeEnabled();
    expect(screen.getByText('Variables')).toBeEnabled();
    expect(screen.getByText('Jobs')).toBeEnabled();
    expect(screen.getByText('Delete')).toBeEnabled();
  });

  it('calls mutate callback', () => {
    const mutate = jest.mocked(props.mutate);
    const {rerender} = render(<CollectionForm {...props} />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value: 'My Other App',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.name).toEqual('My Other App');

    mutate.mockClear();
    fireEvent.click(screen.getByLabelText('Enabled'));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.state).toBe('enabled');

    props.item.state = 'enabled';
    rerender(<CollectionForm {...props} />);

    mutate.mockClear();
    fireEvent.click(screen.getByLabelText('Disabled'));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.state).toBe('disabled');
  });

  it('calls on save callback', () => {
    render(<CollectionForm {...props} />);

    fireEvent.submit(screen.getByText('Save'));

    expect(props.onSave).toHaveBeenCalledWith();
  });

  it('calls on delete callback', () => {
    props.id = '65ada2f9';
    render(
      <Router>
        <CollectionForm {...props} />
      </Router>,
    );

    fireEvent.click(screen.getByText('Delete'));

    expect(props.onDelete).toHaveBeenCalled();
  });

  it('renders no errors', () => {
    const {container} = render(<CollectionForm {...props} />);

    expect(container.querySelectorAll('.is-invalid')).toHaveLength(0);
    expect(container.querySelectorAll('.invalid-feedback')).toHaveLength(0);
  });

  it('renders all errors', () => {
    props.errors = {
      name: 'An error related to name.',
      state: 'An error related to state.',
    };

    const {container} = render(<CollectionForm {...props} />);

    expect(container.querySelectorAll('.is-invalid')).toHaveLength(3);
    expect(container.querySelectorAll('.invalid-feedback')).toHaveLength(2);
    for (const error of Object.values(props.errors)) {
      expect(screen.getByText(error)).toBeVisible();
    }
  });
});
