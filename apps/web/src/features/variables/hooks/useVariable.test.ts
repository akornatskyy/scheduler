import {
  type CollectionItem,
  api as collectionsApi,
} from '$features/collections';
import {ValidationError} from '$shared/errors';
import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import type {Variable} from '../types';
import {useVariable} from './useVariable';

jest.mock('$features/collections');
jest.mock('../api');

const mockNavigate = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('useVariable', () => {
  const id = 'v1';
  const item: Variable = {
    id,
    collectionId: 'c01',
    name: 'My Var #1',
    value: 'Some Value',
    updated: '2025-12-29T22:00:58.348',
  };
  const etag = 'W/"etag"';
  const collections: CollectionItem[] = [
    {id: 'c01', name: 'My App #1', state: 'enabled'},
  ];

  beforeEach(() => jest.clearAllMocks());

  it('initializes add mode and selects first collection', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });

    const {result} = await act(async () => renderHook(() => useVariable()));

    expect(api.getVariable).not.toHaveBeenCalled();
    expect(collectionsApi.listCollections).toHaveBeenCalledTimes(1);

    expect(result.current.item).toEqual({
      name: '',
      collectionId: 'c01',
      value: '',
    });
    expect(result.current.collections).toEqual(collections);
  });

  it('sets field error when collections list is empty', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({items: []});

    const {result} = await act(async () => renderHook(() => useVariable()));

    expect(result.current.errors.collectionId).toMatch(
      /no collection available/i,
    );
  });

  it('loads item when id is provided', async () => {
    jest.mocked(api.getVariable).mockResolvedValue([item, etag]);
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });

    const {result} = await act(async () => renderHook(() => useVariable(id)));

    expect(api.getVariable).toHaveBeenCalledTimes(1);
    expect(api.getVariable).toHaveBeenCalledWith(id);
    expect(result.current.item).toEqual({
      name: 'My Var #1',
      collectionId: 'c01',
      value: 'Some Value',
    });
  });

  it('sets errors when getVariable fails', async () => {
    jest.mocked(api.getVariable).mockRejectedValue(new Error('unexpected'));
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });

    const {result} = await act(async () => renderHook(() => useVariable(id)));

    expect(api.getVariable).toHaveBeenCalledTimes(1);
    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });

  it('sets errors when listCollections fails', async () => {
    jest
      .mocked(collectionsApi.listCollections)
      .mockRejectedValue(new Error('unexpected'));

    const {result} = await act(async () => renderHook(() => useVariable()));

    expect(collectionsApi.listCollections).toHaveBeenCalledTimes(1);
    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });

  it('updates fields', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });
    const {result} = await act(async () => renderHook(() => useVariable()));

    act(() => result.current.mutate((draft) => (draft.name = 'New name')));

    expect(result.current.item.name).toEqual('New name');
  });

  it('sets errors when check fails', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });
    const {result} = await act(async () => renderHook(() => useVariable()));

    await act(() => result.current.save());

    expect(api.createVariable).not.toHaveBeenCalled();
    expect(api.updateVariable).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.errors).toEqual({
      name: 'Required field cannot be left blank.',
    });
  });

  it('creates and navigates to list page', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });
    const {result} = await act(async () => renderHook(() => useVariable()));
    act(() => result.current.mutate((draft) => (draft.name = 'My Var #2')));

    await act(() => result.current.save());

    expect(api.createVariable).toHaveBeenCalledTimes(1);
    expect(api.createVariable).toHaveBeenCalledWith({
      name: 'My Var #2',
      collectionId: 'c01',
      value: '',
    });
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/variables');
  });

  it('sets errors when create fails', async () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest
      .mocked(api.createVariable)
      .mockRejectedValue(new ValidationError(errors));

    const {result} = await act(async () => renderHook(() => useVariable()));
    act(() => result.current.mutate((draft) => (draft.name = 'Valid Name')));

    await act(() => result.current.save());

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.errors).toMatchObject(errors);
  });

  it('updates and navigates to list page', async () => {
    jest.mocked(api.getVariable).mockResolvedValue([item, etag]);
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });
    jest.mocked(api.updateVariable).mockResolvedValue();
    const {result} = await act(async () => renderHook(() => useVariable(id)));
    act(() => result.current.mutate((draft) => (draft.name = 'Updated name')));

    await act(() => result.current.save());

    expect(api.updateVariable).toHaveBeenCalledWith(
      id,
      {name: 'Updated name'},
      etag,
    );
    expect(api.createVariable).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/variables');
  });

  it('sets errors when update fails', async () => {
    jest.mocked(api.getVariable).mockResolvedValue([item, etag]);
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest
      .mocked(api.updateVariable)
      .mockRejectedValue(new ValidationError(errors));
    const {result} = await act(async () => renderHook(() => useVariable(id)));
    act(() => result.current.mutate((draft) => (draft.value = '')));

    await act(() => result.current.save());

    expect(api.updateVariable).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.errors).toMatchObject(errors);
  });

  it('does nothing when remove is called in add mode', async () => {
    const {result} = await act(async () => renderHook(() => useVariable()));

    await act(() => result.current.remove());

    expect(api.deleteVariable).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('removes item and navigates to list page with replace', async () => {
    jest.mocked(api.getVariable).mockResolvedValue([item, etag]);
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });
    jest.mocked(api.deleteVariable).mockResolvedValue();

    const {result} = await act(async () => renderHook(() => useVariable(id)));

    await act(() => result.current.remove());

    expect(api.deleteVariable).toHaveBeenCalledWith(id, etag);
    expect(mockNavigate).toHaveBeenCalledWith('/variables', {replace: true});
  });

  it('sets errors when remove fails', async () => {
    jest.mocked(api.getVariable).mockResolvedValue([item, etag]);
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });
    jest.mocked(api.deleteVariable).mockRejectedValue(new Error('unexpected'));
    const {result} = await act(async () => renderHook(() => useVariable(id)));

    await act(() => result.current.remove());

    expect(api.deleteVariable).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });
});
