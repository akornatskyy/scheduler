import {ValidationError} from '$shared/errors';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {Route, MemoryRouter as Router, Routes} from 'react-router';
import * as api from '../api';
import {CollectionPage} from './CollectionPage';

jest.mock('../api');

const mockNavigate = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('collection page', () => {
  beforeEach(() => jest.clearAllMocks());

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
      id: 'GrvOG8yC',
      name: 'My Other App',
      state: 'disabled',
      updated: '2025-12-29T22:00:58.348',
    });

    await actRenderEdit();

    expect(api.retrieveCollection).toHaveBeenCalledWith('65ada2f9');
    expect(screen.getByRole('form')).toHaveFormValues({
      name: 'My Other App',
      state: 'disabled',
    });
  });

  it('handles retrieve error', async () => {
    jest
      .mocked(api.retrieveCollection)
      .mockRejectedValue(new Error('Unexpected'));

    await actRenderEdit();

    expect(api.retrieveCollection).toHaveBeenCalledWith('65ada2f9');
    expect(screen.getByRole('heading', {name: /Unexpected/})).toBeVisible();
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
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/collections');
  });

  it('handles save errors', async () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest
      .mocked(api.saveCollection)
      .mockRejectedValue(new ValidationError(errors));

    const {container} = await actRenderAdd();

    await act(async () => {
      fireEvent.submit(screen.getByText('Save'));
    });

    expect(api.saveCollection).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', {name: /The error text/})).toBeVisible();
    expect(screen.getByRole('textbox', {name: 'Name'})).toHaveClass(
      'is-invalid',
    );
    expect(screen.getByText(errors.name)).toBeVisible();
    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(1);
  });

  it('deletes item', async () => {
    jest.mocked(api.retrieveCollection).mockResolvedValue({
      id: '65ada2f9',
      name: '',
      state: 'enabled',
      updated: '2025-12-29T22:00:58.348',
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
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/collections', {replace: true});
    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(0);
  });

  it('handles delete error', async () => {
    jest.mocked(api.retrieveCollection).mockResolvedValue({
      id: '65ada2f9',
      name: '',
      state: 'disabled',
      updated: '2025-12-29T22:00:58.348',
      etag: '"1n9er1hz749r"',
    });
    jest
      .mocked(api.deleteCollection)
      .mockRejectedValue(new Error('The error text.'));

    const {container} = await actRenderEdit();

    expect(api.retrieveCollection).toHaveBeenCalledWith('65ada2f9');

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });

    expect(api.deleteCollection).toHaveBeenCalledWith(
      '65ada2f9',
      '"1n9er1hz749r"',
    );
    expect(screen.getByRole('heading', {name: /The error text/})).toBeVisible();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(container.querySelectorAll('p.invalid-feedback')).toHaveLength(0);
  });
});

const actRenderAdd = () =>
  act(async () =>
    render(
      <Router initialEntries={['/collections/add']}>
        <Routes>
          <Route path="/collections/add" element={<CollectionPage />} />
        </Routes>
      </Router>,
    ),
  );

const actRenderEdit = () =>
  act(async () =>
    render(
      <Router initialEntries={['/collections/65ada2f9']}>
        <Routes>
          <Route path="/collections/:id" element={<CollectionPage />} />
        </Routes>
      </Router>,
    ),
  );
