import {act, fireEvent, render, screen} from '@testing-library/react';
import VariableContainer from './variable';
import * as api from './variable-api';

jest.mock('./variable-api.ts');

describe('variable', () => {
  type Props = ConstructorParameters<typeof VariableContainer>[0];
  let props: Props;

  beforeEach(() => {
    props = {
      match: {params: {id: '123de331'}},
      history: {
        goBack: jest.fn(),
      },
    } as unknown as Props;
    jest.mocked(api.listCollections).mockResolvedValue({
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
    props.match.params.id = undefined;
    await act(async () => {
      render(<VariableContainer {...props} />);
    });

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(api.retrieveVariable).toHaveBeenCalledTimes(0);
    expect(screen.getByRole('form')).toHaveFormValues({
      name: '',
      collectionId: '65ada2f9',
      value: '',
    });
  });

  it('renders edit item', async () => {
    jest.mocked(api.retrieveVariable).mockResolvedValue({
      id: '123de331',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
    });

    await act(async () => {
      render(<VariableContainer {...props} />);
    });

    expect(api.retrieveVariable).toHaveBeenCalledTimes(1);
    expect(api.retrieveVariable).toHaveBeenCalledWith('123de331');
    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(api.listCollections).toHaveBeenCalledWith();
    expect(screen.getByRole('form')).toHaveFormValues({
      name: 'My Var #1',
      collectionId: '65ada2f9',
      value: 'Some Value',
    });
  });

  it('shows field error when collections list is empty', async () => {
    props.match.params.id = undefined;
    jest.mocked(api.listCollections).mockResolvedValue({items: []});

    await act(async () => {
      render(<VariableContainer {...props} />);
    });

    expect(api.listCollections).toHaveBeenCalled();
    expect(screen.getByText('There is no collection available.')).toBeVisible();
  });

  it('selects a first item from collections list', async () => {
    props.match.params.id = undefined;
    jest.mocked(api.listCollections).mockResolvedValue({
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
      render(<VariableContainer {...props} />);
    });

    expect(api.listCollections).toHaveBeenCalled();
    expect(screen.getByRole('form')).toHaveFormValues({
      name: '',
      collectionId: '84432333',
      value: '',
    });
  });

  it('selects collection list', async () => {
    jest.mocked(api.retrieveVariable).mockResolvedValue({
      id: '123de331',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
    });
    jest.mocked(api.listCollections).mockResolvedValue({
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
      render(<VariableContainer {...props} />);
    });

    expect(api.listCollections).toHaveBeenCalled();
    expect(screen.getByRole('form')).toHaveFormValues({
      name: 'My Var #1',
      collectionId: '65ada2f9',
      value: 'Some Value',
    });
  });

  it('shows summary error when list collections fails', async () => {
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.listCollections).mockRejectedValue(errors);

    await act(async () => {
      render(<VariableContainer {...props} />);
    });

    expect(api.listCollections).toHaveBeenCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('retrieve error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.retrieveVariable).mockRejectedValue(errors);

    await act(async () => {
      render(<VariableContainer {...props} />);
    });

    expect(api.retrieveVariable).toHaveBeenCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles change', async () => {
    await act(async () => {
      render(<VariableContainer {...props} />);
    });
    expect(api.listCollections).toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value: 'My Other Var',
      },
    });
    fireEvent.change(screen.getByLabelText('Collection'), {
      target: {
        value: '123de331',
      },
    });
    fireEvent.change(screen.getByLabelText('Value'), {
      target: {
        value: 'Hello',
      },
    });

    expect(screen.getByRole('form')).toHaveFormValues({
      name: 'My Other Var',
      collectionId: '123de331',
      value: 'Hello',
    });
  });

  it('saves item', async () => {
    props.match.params.id = undefined;
    jest.mocked(api.saveVariable).mockResolvedValue();
    await act(async () => {
      render(<VariableContainer {...props} />);
    });
    expect(api.listCollections).toHaveBeenCalled();

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveVariable).toHaveBeenCalledWith({
      collectionId: '65ada2f9',
      name: '',
      value: '',
    });
    expect(props.history.goBack).toHaveBeenCalledTimes(1);
  });

  it('handles save errors', async () => {
    props.match.params.id = undefined;
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest.mocked(api.saveVariable).mockRejectedValue(errors);
    await act(async () => {
      render(<VariableContainer {...props} />);
    });
    expect(api.listCollections).toHaveBeenCalled();

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveVariable).toHaveBeenCalledWith({
      collectionId: '65ada2f9',
      name: '',
      value: '',
    });
    expect(props.history.goBack).not.toHaveBeenCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
    expect(screen.getByText(errors.name)).toBeVisible();
  });

  it('deletes item', async () => {
    props.match.params.id = '65ada2f9';
    jest.mocked(api.retrieveVariable).mockResolvedValue({
      id: '65ada2f9',
      name: 'My Var #1',
      collectionId: 'abc',
      value: 'Some Value',
      etag: '"1n9er1hz749r"',
    });
    jest.mocked(api.deleteVariable).mockResolvedValue();
    await act(async () => {
      render(<VariableContainer {...props} />);
    });
    expect(api.listCollections).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteVariable).toHaveBeenCalledWith(
      '65ada2f9',
      '"1n9er1hz749r"',
    );
    expect(props.history.goBack).toHaveBeenCalledTimes(1);
  });

  it('handles delete error', async () => {
    jest.mocked(api.retrieveVariable).mockResolvedValue({
      id: '123de331',
      name: 'My Var #1',
      collectionId: 'abc',
      value: 'Some Value',
    });
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.deleteVariable).mockRejectedValue(errors);
    await act(async () => {
      render(<VariableContainer {...props} />);
    });
    expect(api.listCollections).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteVariable).toHaveBeenCalled();
    expect(props.history.goBack).not.toHaveBeenCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });
});
