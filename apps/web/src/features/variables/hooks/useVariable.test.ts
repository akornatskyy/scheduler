import {api as collectionsApi} from '$features/collections';
import {ValidationError} from '$shared/errors';
import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
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
  beforeEach(() => jest.clearAllMocks());

  it('initializes add mode and selects first collection', async () => {
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });

    const {result} = await act(async () => renderHook(() => useVariable()));

    expect(api.getVariable).not.toHaveBeenCalled();
    expect(collectionsApi.getCollections).toHaveBeenCalledTimes(1);

    expect(result.current.pending).toBe(false);
    expect(result.current.item).toEqual({
      name: '',
      collectionId: '65ada2f9',
      value: '',
    });
    expect(result.current.collections).toEqual([
      {id: '65ada2f9', name: 'My App #1', state: 'enabled'},
    ]);
  });

  it('sets field error when collections list is empty', async () => {
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({items: []});

    const {result} = await act(async () => renderHook(() => useVariable()));

    expect(result.current.pending).toBe(false);
    expect(result.current.errors.collectionId).toMatch(
      /no collection available/i,
    );
  });

  it('loads item when id is provided', async () => {
    jest.mocked(api.getVariable).mockResolvedValue({
      id: '123de331',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
      updated: '2025-12-29T22:00:58.348',
      etag: '"etag"',
    });
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });

    const {result} = await act(async () =>
      renderHook(() => useVariable('123de331')),
    );

    expect(api.getVariable).toHaveBeenCalledTimes(1);
    expect(api.getVariable).toHaveBeenCalledWith('123de331');
    expect(result.current.pending).toBe(false);
    expect(result.current.item).toMatchObject({
      id: '123de331',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
      etag: '"etag"',
    });
  });

  it('sets errors when retrieve fails and clears pending', async () => {
    jest.mocked(api.getVariable).mockRejectedValue(new Error('unexpected'));
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });

    const {result} = await act(async () =>
      renderHook(() => useVariable('123de331')),
    );

    expect(api.getVariable).toHaveBeenCalledTimes(1);
    expect(result.current.pending).toBe(false);
    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });

  it('sets errors when listCollections fails', async () => {
    jest
      .mocked(collectionsApi.getCollections)
      .mockRejectedValue(new Error('unexpected'));

    const {result} = await act(async () => renderHook(() => useVariable()));

    expect(collectionsApi.getCollections).toHaveBeenCalledTimes(1);
    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });

  it('updates fields', async () => {
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });

    const {result} = await act(async () => renderHook(() => useVariable()));

    act(() => result.current.mutate((draft) => (draft.name = 'New name')));

    expect(result.current.item.name).toEqual('New name');
  });

  it('creates and navigates to list page', async () => {
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });
    jest.mocked(api.createVariable).mockResolvedValue();

    const {result} = await act(async () => renderHook(() => useVariable()));

    await act(() => result.current.save());

    expect(api.createVariable).toHaveBeenCalledTimes(1);
    expect(api.createVariable).toHaveBeenCalledWith({
      name: '',
      collectionId: '65ada2f9',
      value: '',
    });
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/variables');
  });

  it('sets errors when create fails and clears pending', async () => {
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });

    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest
      .mocked(api.createVariable)
      .mockRejectedValue(new ValidationError(errors));

    const {result} = await act(async () => renderHook(() => useVariable()));

    await act(() => result.current.save());

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(false);
    expect(result.current.errors).toMatchObject(errors);
  });

  it('updates existing variable and navigates to list page', async () => {
    jest.mocked(api.getVariable).mockResolvedValue({
      id: '123de331',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
      updated: '2025-12-29T22:00:58.348',
      etag: '"etag"',
    });
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });
    jest.mocked(api.updateVariable).mockResolvedValue();

    const {result} = await act(async () =>
      renderHook(() => useVariable('123de331')),
    );

    await act(() => result.current.save());

    expect(api.updateVariable).toHaveBeenCalledTimes(1);
    expect(api.updateVariable).toHaveBeenCalledWith({
      id: '123de331',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
      updated: '2025-12-29T22:00:58.348',
      etag: '"etag"',
    });
    expect(api.createVariable).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/variables');
  });

  it('sets errors when update fails and clears pending', async () => {
    jest.mocked(api.getVariable).mockResolvedValue({
      id: '123de331',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
      updated: '2025-12-29T22:00:58.348',
      etag: '"etag"',
    });
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });

    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest
      .mocked(api.updateVariable)
      .mockRejectedValue(new ValidationError(errors));

    const {result} = await act(async () =>
      renderHook(() => useVariable('123de331')),
    );

    await act(() => result.current.save());

    expect(api.updateVariable).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(false);
    expect(result.current.errors).toMatchObject(errors);
  });

  it('does nothing when remove is called in add mode', async () => {
    const {result} = await act(async () => renderHook(() => useVariable()));

    await act(() => result.current.remove());

    expect(api.deleteVariable).toHaveBeenCalledTimes(0);
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  it('removes item and navigates to list page with replace', async () => {
    jest.mocked(api.getVariable).mockResolvedValue({
      id: '123de331',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
      updated: '2025-12-29T22:00:58.348',
      etag: '"etag"',
    });
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });
    jest.mocked(api.deleteVariable).mockResolvedValue();

    const {result} = await act(async () =>
      renderHook(() => useVariable('123de331')),
    );

    await act(() => result.current.remove());

    expect(api.deleteVariable).toHaveBeenCalledTimes(1);
    expect(api.deleteVariable).toHaveBeenCalledWith('123de331', '"etag"');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/variables', {replace: true});
  });

  it('sets errors when remove fails and clears pending', async () => {
    jest.mocked(api.getVariable).mockResolvedValue({
      id: '123de331',
      collectionId: '65ada2f9',
      name: 'My Var #1',
      value: 'Some Value',
      updated: '2025-12-29T22:00:58.348',
      etag: '"etag"',
    });
    jest.mocked(collectionsApi.getCollections).mockResolvedValue({
      items: [{id: '65ada2f9', name: 'My App #1', state: 'enabled'}],
    });
    jest
      .mocked(api.deleteVariable)
      .mockRejectedValue(new Error('The error text.'));

    const {result} = await act(async () =>
      renderHook(() => useVariable('123de331')),
    );

    await act(() => result.current.remove());

    expect(api.deleteVariable).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(false);
    expect(result.current.errors.__ERROR__).toMatch(/The error text/);
  });
});
