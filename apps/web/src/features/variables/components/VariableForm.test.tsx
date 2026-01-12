import {fireEvent, render, screen} from '@testing-library/react';
import type {VariableInput} from '../types';
import {VariableForm} from './VariableForm';

describe('VariableForm', () => {
  let draft: VariableInput;
  let props: Parameters<typeof VariableForm>[0];

  beforeEach(() => {
    props = {
      item: {name: 'My Var #1', collectionId: '65ada2f9', value: 'Some Value'},
      collections: [
        {id: '65ada2f9', name: 'My App #1', state: 'disabled'},
        {id: 'de1044cc', name: 'My App #2', state: 'enabled'},
      ],
      pending: false,
      errors: {},
      mutate: jest.fn((recipe) => recipe(draft)),
      onSave: jest.fn(),
      onDelete: jest.fn(),
    };
    draft = JSON.parse(JSON.stringify(props.item));
  });

  it('renders add item', () => {
    render(<VariableForm {...props} />);

    expect(screen.getByRole('form')).toHaveFormValues(props.item);
    expect(screen.getByText('Save')).toBeVisible();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('renders edit item', () => {
    render(<VariableForm {...props} id="123de331" />);

    expect(screen.getByRole('form')).toHaveFormValues(props.item);
    expect(screen.getByText('Save')).toBeVisible();
    expect(screen.getByText('Delete')).toBeVisible();
  });

  it('calls mutate callback', () => {
    const mutate = jest.mocked(props.mutate);
    render(<VariableForm {...props} />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value: 'My Other Var',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.name).toBe('My Other Var');

    mutate.mockClear();
    fireEvent.change(screen.getByLabelText('Collection'), {
      target: {
        value: 'de1044cc',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.collectionId).toBe('de1044cc');

    mutate.mockClear();
    fireEvent.change(screen.getByLabelText('Value'), {
      target: {
        value: 'Hello',
      },
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(draft.value).toBe('Hello');
  });

  it('calls on save callback', () => {
    const handler = jest.mocked(props.onSave);
    render(<VariableForm {...props} />);

    fireEvent.submit(screen.getByText('Save'));

    expect(handler).toHaveBeenCalled();
  });

  it('calls on delete callback', () => {
    props.id = '65ada2f9';
    const handler = jest.mocked(props.onDelete);
    render(<VariableForm {...props} />);

    fireEvent.click(screen.getByText('Delete'));

    expect(handler).toHaveBeenCalled();
  });

  it('renders no errors', () => {
    const {container} = render(<VariableForm {...props} />);

    expect(container.querySelectorAll('.is-invalid')).toHaveLength(0);
    expect(container.querySelectorAll('.invalid-feedback')).toHaveLength(0);
  });

  it('renders all errors', () => {
    const errors: Record<string, string> = {
      collectionId: 'An error related to collection id.',
      name: 'An error related to name.',
      value: 'An error related to value.',
    };

    const {container} = render(<VariableForm {...props} errors={errors} />);

    expect(container.querySelectorAll('.is-invalid')).toHaveLength(3);
    expect(container.querySelectorAll('.invalid-feedback')).toHaveLength(3);
    for (const error of Object.values(props.errors)) {
      expect(screen.getByText(error)).toBeVisible();
    }
  });
});
