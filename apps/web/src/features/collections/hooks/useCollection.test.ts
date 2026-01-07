import {ValidationError} from '$shared/errors';
import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import {Collection} from '../types';
import {useCollection} from './useCollection';

jest.mock('../api');

const mockNavigate = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('useCollection', () => {
  const id = '65ada2f9';
  const item: Collection = {
    id,
    name: 'My App #1',
    state: 'enabled',
    updated: '2025-12-29T22:00:58.348',
  };
  const etag = 'W/"etag"';

  beforeEach(() => jest.clearAllMocks());

  it('initializes add mode when no id is provided', async () => {
    const {result} = await act(async () => renderHook(() => useCollection()));

    expect(api.getCollection).toHaveBeenCalledTimes(0);
    expect(result.current.pending).toBe(false);
    expect(result.current.item).toEqual({name: '', state: 'enabled'});
    expect(result.current.errors).toEqual({});
  });

  it('loads item when id is provided', async () => {
    jest.mocked(api.getCollection).mockResolvedValue([item, etag]);

    const {result} = await act(async () => renderHook(() => useCollection(id)));

    expect(api.getCollection).toHaveBeenCalledTimes(1);
    expect(api.getCollection).toHaveBeenCalledWith(id);
    expect(result.current.pending).toBe(false);
    expect(result.current.item).toEqual({
      name: 'My App #1',
      state: 'enabled',
    });
    expect(result.current.errors).toEqual({});
  });

  it('sets errors when load fails', async () => {
    jest.mocked(api.getCollection).mockRejectedValue(new Error('unexpected'));

    const {result} = await act(async () => renderHook(() => useCollection(id)));

    expect(api.getCollection).toHaveBeenCalledTimes(1);
    expect(result.current.pending).toBe(false);
    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });

  it('updates fields', async () => {
    const {result} = await act(async () => renderHook(() => useCollection()));

    act(() => result.current.mutate((draft) => (draft.name = 'New name')));

    expect(result.current.item.name).toEqual('New name');
  });

  it('creates and navigates to list page', async () => {
    const {result} = await act(async () => renderHook(() => useCollection()));

    await act(() => result.current.save());

    expect(api.createCollection).toHaveBeenCalledWith({
      name: '',
      state: 'enabled',
    });
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/collections');
  });

  it('sets errors when create fails and clears pending', async () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest
      .mocked(api.createCollection)
      .mockRejectedValue(new ValidationError(errors));

    const {result} = await act(async () => renderHook(() => useCollection()));

    await act(() => result.current.save());

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(false);
    expect(result.current.errors).toMatchObject(errors);
  });

  it('updates and navigates to list page', async () => {
    jest.mocked(api.getCollection).mockResolvedValue([item, etag]);
    jest.mocked(api.updateCollection).mockResolvedValue();
    const {result} = await act(async () => renderHook(() => useCollection(id)));
    act(() => result.current.mutate((draft) => (draft.name = 'Updated name')));

    await act(() => result.current.save());

    expect(api.updateCollection).toHaveBeenCalledTimes(1);
    expect(api.updateCollection).toHaveBeenCalledWith(
      id,
      {name: 'Updated name'},
      etag,
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/collections');
  });

  it('sets errors when update fails and clears pending', async () => {
    jest.mocked(api.getCollection).mockResolvedValue([item, etag]);
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest
      .mocked(api.updateCollection)
      .mockRejectedValue(new ValidationError(errors));
    const {result} = await act(async () => renderHook(() => useCollection(id)));
    act(() => result.current.mutate((draft) => (draft.state = 'disabled')));

    await act(() => result.current.save());

    expect(api.updateCollection).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(false);
    expect(result.current.errors).toMatchObject(errors);
  });

  it('removes item and navigates to list page with replace', async () => {
    jest.mocked(api.getCollection).mockResolvedValue([item, etag]);
    jest.mocked(api.deleteCollection).mockResolvedValue();

    const {result} = await act(async () => renderHook(() => useCollection(id)));

    await act(() => result.current.remove());

    expect(api.deleteCollection).toHaveBeenCalledTimes(1);
    expect(api.deleteCollection).toHaveBeenCalledWith(id, etag);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/collections', {replace: true});
  });

  it('does nothing when remove is called in add mode', async () => {
    const {result} = await act(async () => renderHook(() => useCollection()));

    await act(() => result.current.remove());

    expect(api.deleteCollection).toHaveBeenCalledTimes(0);
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  it('sets errors when remove fails and clears pending', async () => {
    jest.mocked(api.getCollection).mockResolvedValue([item, etag]);
    jest
      .mocked(api.deleteCollection)
      .mockRejectedValue(new Error('unexpected'));

    const {result} = await act(async () => renderHook(() => useCollection(id)));

    await act(() => result.current.remove());

    expect(api.deleteCollection).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(false);
    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });
});
