import {ValidationError} from '$shared/errors';
import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import type {Collection} from '../types';
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
    expect(result.current.item).toEqual({name: '', state: 'enabled'});
    expect(result.current.errors).toEqual({});
  });

  it('loads item when id is provided', async () => {
    jest.mocked(api.getCollection).mockResolvedValue([item, etag]);

    const {result} = await act(async () => renderHook(() => useCollection(id)));

    expect(api.getCollection).toHaveBeenCalledTimes(1);
    expect(api.getCollection).toHaveBeenCalledWith(id);
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
    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });

  it('updates fields', async () => {
    const {result} = await act(async () => renderHook(() => useCollection()));

    act(() => result.current.mutate((draft) => (draft.name = 'New name')));

    expect(result.current.item.name).toEqual('New name');
  });

  it('sets errors when check fails', async () => {
    const {result} = await act(async () => renderHook(() => useCollection()));

    await act(() => result.current.save());

    expect(api.createCollection).not.toHaveBeenCalled();
    expect(api.updateCollection).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.errors).toEqual({
      name: 'Required field cannot be left blank.',
    });
  });

  it('creates and navigates to list page', async () => {
    const {result} = await act(async () => renderHook(() => useCollection()));
    act(() => result.current.mutate((draft) => (draft.name = 'My App #2')));

    await act(() => result.current.save());

    expect(api.createCollection).toHaveBeenCalledWith({
      name: 'My App #2',
      state: 'enabled',
    });
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/collections');
  });

  it('sets errors when create fails', async () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest
      .mocked(api.createCollection)
      .mockRejectedValue(new ValidationError(errors));

    const {result} = await act(async () => renderHook(() => useCollection()));
    act(() => result.current.mutate((draft) => (draft.name = 'Valid Name')));

    await act(() => result.current.save());

    expect(mockNavigate).not.toHaveBeenCalled();
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

  it('sets errors when update fails', async () => {
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

  it('sets errors when remove fails', async () => {
    jest.mocked(api.getCollection).mockResolvedValue([item, etag]);
    jest
      .mocked(api.deleteCollection)
      .mockRejectedValue(new Error('unexpected'));

    const {result} = await act(async () => renderHook(() => useCollection(id)));

    await act(() => result.current.remove());

    expect(api.deleteCollection).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });
});
