import {type CollectionItem, collectionsApi} from '$features/collections';
import {ValidationError} from '$shared/errors';
import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import type {JobDefinition} from '../types';
import {useJob} from './useJob';

jest.mock('$features/collections');
jest.mock('../api');

const mockNavigate = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {...actual, useNavigate: () => mockNavigate};
});

describe('useJob', () => {
  const id = 'xphekQqIUM8';
  const item: JobDefinition = {
    id,
    name: 'Job #1',
    state: 'enabled',
    schedule: '* * * * *',
    collectionId: 'c02',
    action: {
      type: 'HTTP',
      request: {
        method: 'GET',
        uri: 'https://example.com',
        headers: [],
        body: '',
      },
      retryPolicy: {retryCount: 3, retryInterval: '10s', deadline: '1m'},
    },
    status: 'ready',
    updated: '2025-12-30T09:29:11.301',
  };
  const etag = 'W/"123"';
  const collections: CollectionItem[] = [
    {id: 'c01', name: 'Collection #1', state: 'enabled'},
    {id: 'c02', name: 'Collection #2', state: 'disabled'},
  ];

  beforeEach(() => jest.clearAllMocks());

  it('handles retrieve job errors', async () => {
    jest.mocked(api.getJob).mockRejectedValue(new Error('unexpected'));
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });

    const {result} = await act(async () => renderHook(() => useJob(id)));

    expect(api.getJob).toHaveBeenCalledTimes(1);
    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });

  it('retrieves job when id is provided', async () => {
    jest.mocked(api.getJob).mockResolvedValue([item, etag]);
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });

    const {result} = await act(async () => renderHook(() => useJob(id)));

    expect(api.getJob).toHaveBeenCalledTimes(1);
    expect(api.getJob).toHaveBeenCalledWith(id);
    expect(collectionsApi.listCollections).toHaveBeenCalledTimes(1);
    expect(result.current.item).toEqual({
      name: 'Job #1',
      state: 'enabled',
      schedule: '* * * * *',
      collectionId: 'c02',
      action: {
        type: 'HTTP',
        request: {
          method: 'GET',
          uri: 'https://example.com',
          headers: [],
          body: '',
        },
        retryPolicy: {retryCount: 3, retryInterval: '10s', deadline: '1m'},
      },
    });
  });

  it('sets a default collectionId when creating and collections exist', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });

    const {result} = await act(async () => renderHook(() => useJob()));

    expect(api.getJob).not.toHaveBeenCalled();
    expect(collectionsApi.listCollections).toHaveBeenCalledTimes(1);
    expect(result.current.item.collectionId).toBe('c01');
    expect(result.current.errors.collectionId).toBeUndefined();
  });

  it('sets collectionId error when no collections exist', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({items: []});

    const {result} = await act(async () => renderHook(() => useJob()));

    expect(result.current.errors.collectionId).toMatch(/no collection/i);
  });

  it('does not override existing collectionId on item', async () => {
    jest.mocked(api.getJob).mockResolvedValue([item, etag]);
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });

    const {result} = await act(async () => renderHook(() => useJob(id)));

    expect(result.current.item.collectionId).toBe('c02');
    expect(result.current.errors.collectionId).toBeUndefined();
  });

  it('handles list collections errors', async () => {
    jest
      .mocked(collectionsApi.listCollections)
      .mockRejectedValue(new Error('unexpected'));

    const {result} = await act(async () => renderHook(() => useJob()));

    expect(collectionsApi.listCollections).toHaveBeenCalledTimes(1);
    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });

  it('updates fields', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({items: []});
    const {result} = await act(async () => renderHook(() => useJob()));

    act(() => result.current.mutate((draft) => (draft.name = 'New name')));

    expect(result.current.item.name).toBe('New name');
  });

  it('sets errors when check fails', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });
    const {result} = await act(async () => renderHook(() => useJob()));

    await act(async () => result.current.save());

    expect(api.createJob).not.toHaveBeenCalled();
    expect(api.updateJob).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.errors).toEqual({
      name: 'Required field cannot be left blank.',
      schedule: 'Required field cannot be left blank.',
      uri: 'Required field cannot be left blank.',
    });
  });

  it('creates and navigates on success', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });
    const {result} = await act(async () => renderHook(() => useJob()));
    act(() => {
      result.current.mutate((draft) => {
        draft.name = 'Valid Job';
        draft.schedule = '* * * * *';
        draft.action.request.uri = 'https://example.com';
      });
    });

    await act(async () => result.current.save());

    expect(api.createJob).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/jobs');
  });

  it('sets errors on create failure', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.createJob).mockRejectedValue(new Error('unexpected'));
    const {result} = await act(async () => renderHook(() => useJob()));

    await act(async () => result.current.save());

    expect(result.current.errors).toEqual(expect.any(Object));
  });

  it('updates and navigates to list page', async () => {
    jest.mocked(api.getJob).mockResolvedValue([item, etag]);
    jest
      .mocked(collectionsApi.listCollections)
      .mockResolvedValue({items: collections});
    jest.mocked(api.updateJob).mockResolvedValue();
    const {result} = await act(async () => renderHook(() => useJob(id)));
    act(() => result.current.mutate((draft) => (draft.name = 'Updated name')));

    await act(async () => result.current.save());

    expect(api.updateJob).toHaveBeenCalledTimes(1);
    expect(api.updateJob).toHaveBeenCalledWith(
      id,
      {name: 'Updated name'},
      etag,
    );
    expect(api.createJob).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/jobs');
  });

  it('sets errors when update fails', async () => {
    jest.mocked(api.getJob).mockResolvedValue([item, etag]);
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({
      items: collections,
    });
    const errors = {
      __ERROR__: 'The error text.',
      name: 'The field error message.',
    };
    jest.mocked(api.updateJob).mockRejectedValue(new ValidationError(errors));
    const {result} = await act(async () => renderHook(() => useJob(id)));
    act(() => result.current.mutate((draft) => (draft.state = 'disabled')));

    await act(() => result.current.save());

    expect(api.updateJob).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.errors).toMatchObject(errors);
  });

  it('does nothing when remove is called in add mode', async () => {
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({items: []});
    const {result} = await act(async () => renderHook(() => useJob()));

    await act(async () => result.current.remove());

    expect(api.deleteJob).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('removes item and navigates to list page with replace', async () => {
    jest.mocked(api.getJob).mockResolvedValue([item, etag]);
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.deleteJob).mockResolvedValue();
    const {result} = await act(async () => renderHook(() => useJob(id)));

    await act(async () => result.current.remove());

    expect(api.deleteJob).toHaveBeenCalledWith(id, 'W/"123"');
    expect(mockNavigate).toHaveBeenCalledWith('/jobs', {replace: true});
  });

  it('sets errors when remove fails', async () => {
    jest.mocked(api.getJob).mockResolvedValue([item, etag]);
    jest.mocked(collectionsApi.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.deleteJob).mockRejectedValue(new Error('unexpected'));

    const {result} = await act(async () => renderHook(() => useJob(id)));

    await act(async () => result.current.remove());

    expect(api.deleteJob).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.errors.__ERROR__).toMatch(/unexpected/);
  });
});
