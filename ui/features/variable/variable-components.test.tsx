import {fireEvent, render, screen} from '@testing-library/react';
import {VariableForm} from './variable-components';

describe('variable', () => {
  let props: Parameters<typeof VariableForm>[0];

  beforeEach(() => {
    props = {
      item: {
        id: '',
        collectionId: '65ada2f9',
        name: 'My Var #1',
        value: 'Some Value',
      },
      collections: [
        {id: '65ada2f9', name: 'My App #1'},
        {id: 'de1044cc', name: 'My App #2'},
      ],
      pending: false,
      errors: {},
    };
  });

  it('renders add item', () => {
    render(<VariableForm {...props} />);

    expect(screen.getByLabelText('Name')).toHaveValue('My Var #1');
    expect(screen.getByLabelText('Value')).toHaveValue('Some Value');
    expect(screen.getByLabelText('Collection')).toHaveTextContent('My App #1');
    expect(screen.getByText('Save')).toBeVisible();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('renders edit item', () => {
    render(<VariableForm {...props} item={{...props.item, id: '123de331'}} />);

    expect(screen.getByLabelText('Name')).toHaveValue('My Var #1');
    expect(screen.getByLabelText('Collection')).toHaveTextContent('My App #1');
    expect(screen.getByLabelText('Value')).toHaveValue('Some Value');
    expect(screen.getByText('Save')).toBeVisible();
    expect(screen.getByText('Delete')).toBeVisible();
  });

  it('calls on change callback', () => {
    const handler = jest.fn();
    render(<VariableForm {...props} onChange={handler} />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value: 'My Other Var',
      },
    });
    fireEvent.change(screen.getByLabelText('Collection'), {
      target: {
        value: 'de1044cc',
      },
    });
    fireEvent.change(screen.getByLabelText('Value'), {
      target: {
        value: 'Hello',
      },
    });

    expect(handler).toHaveBeenCalledTimes(3);
    expect(handler).toHaveBeenNthCalledWith(1, 'name', 'My Other Var');
    expect(handler).toHaveBeenNthCalledWith(2, 'collectionId', 'de1044cc');
    expect(handler).toHaveBeenNthCalledWith(3, 'value', 'Hello');
  });

  it('calls on save callback', () => {
    const handler = jest.fn();
    render(<VariableForm {...props} onSave={handler} />);

    fireEvent.submit(screen.getByText('Save'));

    expect(handler).toHaveBeenCalled();
  });

  it('calls on delete callback', () => {
    props.item.id = '65ada2f9';
    const handler = jest.fn();
    render(<VariableForm {...props} onDelete={handler} />);

    fireEvent.click(screen.getByText('Delete'));

    expect(handler).toHaveBeenCalled();
  });

  it('handles undefined callbacks', () => {
    props.item.id = '65ada2f9';
    render(<VariableForm {...props} />);

    fireEvent.change(screen.getByLabelText('Name'));
    fireEvent.click(screen.getByText('Save'));
    fireEvent.click(screen.getByText('Delete'));
  });

  it('renders no errors', () => {
    const {container} = render(<VariableForm {...props} />);

    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(0);
  });

  it('renders all errors', () => {
    const errors: Record<string, string> = {
      collectionId: 'An error related to collection id.',
      name: 'An error related to name.',
      value: 'An error related to value.',
    };

    render(<VariableForm {...props} errors={errors} />);

    for (const name of Object.getOwnPropertyNames(errors)) {
      expect(screen.getByText(errors[name])).toBeVisible();
    }
  });
});
