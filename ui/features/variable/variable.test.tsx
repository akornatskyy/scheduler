import {act, fireEvent, render, screen} from '@testing-library/react';
import {Route, MemoryRouter as Router, Routes} from 'react-router';
import VariableContainer from './variable';
import * as api from './variable-api';

jest.mock('./variable-api');

const mockNavigate = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('variable container', () => {
  const goBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockImplementationOnce(goBack);
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
  });

  it('renders add item if no id specified', async () => {
    await actRenderAdd();

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

    await actRenderEdit();

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
    jest.mocked(api.listCollections).mockResolvedValue({items: []});

    await actRenderAdd();

    expect(api.listCollections).toHaveBeenCalled();
    expect(screen.getByText('There is no collection available.')).toBeVisible();
  });

  it('selects a first item from collections list', async () => {
    await actRenderAdd();

    expect(api.listCollections).toHaveBeenCalled();
    expect(screen.getByRole('form')).toHaveFormValues({
      name: '',
      collectionId: '65ada2f9',
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

    await actRenderEdit();

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

    await actRenderEdit();

    expect(api.listCollections).toHaveBeenCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('retrieve error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.retrieveVariable).mockRejectedValue(errors);

    await actRenderEdit();

    expect(api.retrieveVariable).toHaveBeenCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles change', async () => {
    await actRenderEdit();

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
    jest.mocked(api.saveVariable).mockResolvedValue();

    await actRenderAdd();

    expect(api.listCollections).toHaveBeenCalled();

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveVariable).toHaveBeenCalledWith({
      collectionId: '65ada2f9',
      name: '',
      value: '',
    });
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('handles save errors', async () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest.mocked(api.saveVariable).mockRejectedValue(errors);

    await actRenderAdd();

    expect(api.listCollections).toHaveBeenCalled();

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveVariable).toHaveBeenCalledWith({
      collectionId: '65ada2f9',
      name: '',
      value: '',
    });
    expect(goBack).not.toHaveBeenCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
    expect(screen.getByText(errors.name)).toBeVisible();
  });

  it('deletes item', async () => {
    jest.mocked(api.retrieveVariable).mockResolvedValue({
      id: '65ada2f9',
      name: 'My Var #1',
      collectionId: 'abc',
      value: 'Some Value',
      etag: '"1n9er1hz749r"',
    });
    jest.mocked(api.deleteVariable).mockResolvedValue();

    await actRenderEdit();

    expect(api.listCollections).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteVariable).toHaveBeenCalledWith(
      '65ada2f9',
      '"1n9er1hz749r"',
    );
    expect(goBack).toHaveBeenCalledTimes(1);
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

    await actRenderEdit();

    expect(api.listCollections).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteVariable).toHaveBeenCalled();
    expect(goBack).not.toHaveBeenCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });
});

const actRenderAdd = () =>
  act(async () =>
    render(
      <Router initialEntries={['/variables/add']}>
        <Routes>
          <Route path="/variables/add" element={<VariableContainer />} />
        </Routes>
      </Router>,
    ),
  );

const actRenderEdit = () =>
  act(async () =>
    render(
      <Router initialEntries={['/variables/123de331']}>
        <Routes>
          <Route path="/variables/:id" element={<VariableContainer />} />
        </Routes>
      </Router>,
    ),
  );
