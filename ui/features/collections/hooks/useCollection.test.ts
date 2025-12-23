import {ValidationError} from '$shared/errors';
import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
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
  beforeEach(() => jest.clearAllMocks());

  it('initializes add mode when no id is provided', async () => {
    const {result} = await act(async () => renderHook(() => useCollection()));

    expect(api.retrieveCollection).toHaveBeenCalledTimes(0);
    expect(result.current.pending).toBe(false);
    expect(result.current.item).toEqual({name: '', state: 'enabled'});
    expect(result.current.errors).toEqual({});
  });

  it('loads item when id is provided', async () => {
    jest.mocked(api.retrieveCollection).mockResolvedValue({
      id: '65ada2f9',
      name: 'My App #1',
      state: 'disabled',
      updated: '2025-12-29T22:00:58.348',
      etag: '"abc"',
    });

    const {result} = await act(async () =>
      renderHook(() => useCollection('65ada2f9')),
    );

    expect(api.retrieveCollection).toHaveBeenCalledTimes(1);
    expect(api.retrieveCollection).toHaveBeenCalledWith('65ada2f9');
    expect(result.current.pending).toBe(false);
    expect(result.current.item).toMatchObject({
      id: '65ada2f9',
      name: 'My App #1',
      state: 'disabled',
      etag: '"abc"',
    });
  });

  it('sets errors when load fails', async () => {
    jest
      .mocked(api.retrieveCollection)
      .mockRejectedValue(new Error('Unexpected'));

    const {result} = await act(async () =>
      renderHook(() => useCollection('65ada2f9')),
    );

    expect(api.retrieveCollection).toHaveBeenCalledTimes(1);
    expect(result.current.pending).toBe(false);
    expect(result.current.errors.__ERROR__).toMatch(/Unexpected/);
  });

  it('updates fields', async () => {
    const {result} = await act(async () => renderHook(() => useCollection()));

    act(() => result.current.updateField('name', 'Hello'));
    act(() => result.current.updateField('state', 'disabled'));

    expect(result.current.item).toEqual({name: 'Hello', state: 'disabled'});
  });

  it('saves and navigates to list page', async () => {
    jest.mocked(api.saveCollection).mockResolvedValue();

    const {result} = await act(async () => renderHook(() => useCollection()));

    await act(() => result.current.save());

    expect(api.saveCollection).toHaveBeenCalledTimes(1);
    expect(api.saveCollection).toHaveBeenCalledWith({
      name: '',
      state: 'enabled',
    });
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/collections');
  });

  it('sets errors when save fails and clears pending', async () => {
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest
      .mocked(api.saveCollection)
      .mockRejectedValue(new ValidationError(errors));

    const {result} = await act(async () => renderHook(() => useCollection()));

    await act(() => result.current.save());

    expect(api.saveCollection).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(false);
    expect(result.current.errors).toMatchObject(errors);
  });

  it('removes item and navigates to list page with replace', async () => {
    jest.mocked(api.retrieveCollection).mockResolvedValue({
      id: '65ada2f9',
      name: 'My App #1',
      state: 'enabled',
      updated: '2025-12-29T22:00:58.348',
      etag: '"etag"',
    });
    jest.mocked(api.deleteCollection).mockResolvedValue();

    const {result} = await act(async () =>
      renderHook(() => useCollection('65ada2f9')),
    );

    await act(() => result.current.remove());

    expect(api.deleteCollection).toHaveBeenCalledTimes(1);
    expect(api.deleteCollection).toHaveBeenCalledWith('65ada2f9', '"etag"');
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
    jest.mocked(api.retrieveCollection).mockResolvedValue({
      id: '65ada2f9',
      name: 'My App #1',
      state: 'enabled',
      updated: '2025-12-29T22:00:58.348',
      etag: '"etag"',
    });
    jest
      .mocked(api.deleteCollection)
      .mockRejectedValue(new Error('The error text.'));

    const {result} = await act(async () =>
      renderHook(() => useCollection('65ada2f9')),
    );

    await act(() => result.current.remove());

    expect(api.deleteCollection).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.pending).toBe(false);
    expect(result.current.errors.__ERROR__).toMatch(/The error text/);
  });
});
