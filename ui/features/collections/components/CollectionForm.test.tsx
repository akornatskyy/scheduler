import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter as Router} from 'react-router';
import {CollectionInput} from '../types';
import {CollectionForm} from './CollectionForm';

describe('collection form component', () => {
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
    const handler = jest.mocked(props.onSave);
    render(<CollectionForm {...props} />);

    fireEvent.submit(screen.getByText('Save'));

    expect(handler).toHaveBeenCalledWith();
  });

  it('calls on delete callback', () => {
    props.item.id = '65ada2f9';
    const handler = jest.mocked(props.onDelete);
    render(
      <Router>
        <CollectionForm {...props} />
      </Router>,
    );

    fireEvent.click(screen.getByText('Delete'));

    expect(handler).toHaveBeenCalled();
  });

  it('renders no errors', () => {
    const {container} = render(<CollectionForm {...props} />);

    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(0);
  });

  it('renders all errors', () => {
    const errors: Record<string, string> = {
      name: 'An error related to name.',
      state: 'An error related to state.',
    };

    render(<CollectionForm {...props} errors={errors} />);

    for (const name of Object.getOwnPropertyNames(errors)) {
      expect(screen.getByText(errors[name])).toBeVisible();
    }
  });
});
