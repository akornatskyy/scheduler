import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import Variable from './variable';
import * as api from './variable-api';

jest.mock('./variable-api');

describe('variable', () => {
  let props = null;

  beforeEach(() => {
    props = {
      match: {params: {id: '123de331'}},
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
      render(<Variable {...props} />);
    });

    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(api.retrieveVariable).toBeCalledTimes(0);
    expect(screen.getByRole('form')).toHaveFormValues({
      name: '',
      collectionId: '65ada2f9',
      value: '',
    });
  });

  it('renders edit item', async () => {
    api.retrieveVariable.mockResolvedValue({
      id: '123de331',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
    });

    await act(async () => {
      render(<Variable {...props} />);
    });

    expect(api.retrieveVariable).toBeCalledTimes(1);
    expect(api.retrieveVariable).toBeCalledWith('123de331');
    expect(api.listCollections).toBeCalledTimes(1);
    expect(api.listCollections).toBeCalledWith();
    expect(screen.getByRole('form')).toHaveFormValues({
      name: 'My Var #1',
      collectionId: '65ada2f9',
      value: 'Some Value',
    });
  });

  it('shows field error when collections list is empty', async () => {
    props.match.params.id = null;
    api.listCollections.mockResolvedValue({items: []});

    await act(async () => {
      render(<Variable {...props} />);
    });

    expect(api.listCollections).toBeCalled();
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
      render(<Variable {...props} />);
    });

    expect(api.listCollections).toBeCalled();
    expect(screen.getByRole('form')).toHaveFormValues({
      name: '',
      collectionId: '84432333',
      value: '',
    });
  });

  it('selects collection list', async () => {
    api.retrieveVariable.mockResolvedValue({
      id: '123de331',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
    });
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
      render(<Variable {...props} />);
    });

    expect(api.listCollections).toBeCalled();
    expect(screen.getByRole('form')).toHaveFormValues({
      name: 'My Var #1',
      collectionId: '65ada2f9',
      value: 'Some Value',
    });
  });

  it('shows summary error when list collections fails', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.listCollections.mockRejectedValue(errors);

    await act(async () => {
      render(<Variable {...props} />);
    });

    expect(api.listCollections).toBeCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('retrieve error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    api.retrieveVariable.mockRejectedValue(errors);

    await act(async () => {
      render(<Variable {...props} />);
    });

    expect(api.retrieveVariable).toBeCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles change', async () => {
    await act(async () => {
      render(<Variable {...props} />);
    });
    expect(api.listCollections).toBeCalled();

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
    props.match.params.id = null;
    api.saveVariable.mockResolvedValue();
    await act(async () => {
      render(<Variable {...props} />);
    });
    expect(api.listCollections).toBeCalled();

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveVariable).toBeCalledWith({
      collectionId: '65ada2f9',
      name: '',
      value: '',
    });
    expect(props.history.goBack.mock.calls.length).toBe(1);
  });

  it('handles save errors', async () => {
    props.match.params.id = null;
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    api.saveVariable.mockRejectedValue(errors);
    await act(async () => {
      render(<Variable {...props} />);
    });
    expect(api.listCollections).toBeCalled();

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveVariable).toBeCalledWith({
      collectionId: '65ada2f9',
      name: '',
      value: '',
    });
    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
    expect(screen.getByText(errors.name)).toBeVisible();
  });

  it('deletes item', async () => {
    props.match.params.id = '65ada2f9';
    api.retrieveVariable.mockResolvedValue({
      id: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
      etag: '"1n9er1hz749r"',
    });
    api.deleteVariable.mockResolvedValue();
    await act(async () => {
      render(<Variable {...props} />);
    });
    expect(api.listCollections).toBeCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteVariable).toBeCalledWith('65ada2f9', '"1n9er1hz749r"');
    expect(props.history.goBack.mock.calls.length).toBe(1);
  });

  it('handles delete error', async () => {
    api.retrieveVariable.mockResolvedValue({
      id: '123de331',
      name: 'My Var #1',
      value: 'Some Value',
    });
    const errors = {__ERROR__: 'The error text.'};
    api.deleteVariable.mockRejectedValue(errors);
    await act(async () => {
      render(<Variable {...props} />);
    });
    expect(api.listCollections).toBeCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteVariable).toBeCalled();
    expect(props.history.goBack.mock.calls.length).toBe(0);
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });
});
