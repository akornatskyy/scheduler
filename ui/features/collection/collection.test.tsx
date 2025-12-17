import {act, fireEvent, render, screen} from '@testing-library/react';
import {Route, MemoryRouter as Router, Routes} from 'react-router';
import CollectionContainer from './collection';
import * as api from './collection-api';

jest.mock('./collection-api');

const mockNavigate = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('collection container', () => {
  const goBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockImplementationOnce(goBack);
  });

  it('renders add item if no id specified', async () => {
    await actRenderAdd();

    expect(api.retrieveCollection).toHaveBeenCalledTimes(0);
    expect(screen.getByRole('form')).toHaveFormValues({
      name: '',
      state: 'enabled',
    });
  });

  it('renders edit item', async () => {
    jest.mocked(api.retrieveCollection).mockResolvedValue({
      name: 'My Other App',
      state: 'disabled',
    });

    await actRenderEdit();

    expect(api.retrieveCollection).toHaveBeenCalledWith('65ada2f9');
    expect(screen.getByRole('form')).toHaveFormValues({
      name: 'My Other App',
      state: 'disabled',
    });
  });

  it('handles retrieve error', async () => {
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.retrieveCollection).mockRejectedValue(errors);

    await actRenderEdit();

    expect(api.retrieveCollection).toHaveBeenCalledWith('65ada2f9');
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
  });

  it('handles change', async () => {
    await actRenderEdit();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value: 'My Other App',
      },
    });
    fireEvent.click(screen.getByLabelText('Disabled'));

    expect(screen.getByRole('form')).toHaveFormValues({
      name: 'My Other App',
      state: 'disabled',
    });
  });

  it('saves item', async () => {
    jest.mocked(api.saveCollection).mockResolvedValue();

    await actRenderAdd();

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveCollection).toHaveBeenCalledTimes(1);
    expect(api.saveCollection).toHaveBeenCalledWith({
      name: '',
      state: 'enabled',
    });
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('handles save errors', async () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest.mocked(api.saveCollection).mockRejectedValue(errors);

    await actRenderAdd();

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveCollection).toHaveBeenCalledTimes(1);
    expect(goBack).not.toHaveBeenCalled();
    expect(screen.getByText(errors.__ERROR__)).toBeVisible();
    expect(screen.getByText(errors.name)).toBeVisible();
  });

  it('deletes item', async () => {
    jest.mocked(api.retrieveCollection).mockResolvedValue({
      id: '65ada2f9',
      name: '',
      state: 'enabled',
      etag: '"1n9er1hz749r"',
    });
    jest.mocked(api.deleteCollection).mockResolvedValue();

    const {container} = await actRenderEdit();

    expect(api.retrieveCollection).toHaveBeenCalledWith('65ada2f9');

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteCollection).toHaveBeenCalledWith(
      '65ada2f9',
      '"1n9er1hz749r"',
    );
    expect(goBack).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(0);
  });

  it('handles delete error', async () => {
    jest.mocked(api.retrieveCollection).mockResolvedValue({
      id: '65ada2f9',
      name: '',
      state: 'disabled',
      etag: '"1n9er1hz749r"',
    });
    const errors = {__ERROR__: 'The error text.'};
    jest.mocked(api.deleteCollection).mockRejectedValue(errors);

    const {container} = await actRenderEdit();

    expect(api.retrieveCollection).toHaveBeenCalledWith('65ada2f9');

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteCollection).toHaveBeenCalledWith(
      '65ada2f9',
      '"1n9er1hz749r"',
    );
    expect(goBack).not.toHaveBeenCalled();
    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(0);
  });
});

const actRenderAdd = () =>
  act(async () =>
    render(
      <Router initialEntries={['/collections/add']}>
        <Routes>
          <Route path="/collections/add" element={<CollectionContainer />} />
        </Routes>
      </Router>,
    ),
  );

const actRenderEdit = () =>
  act(async () =>
    render(
      <Router initialEntries={['/collections/65ada2f9']}>
        <Routes>
          <Route path="/collections/:id" element={<CollectionContainer />} />
        </Routes>
      </Router>,
    ),
  );
