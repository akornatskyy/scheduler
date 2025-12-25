import {act, renderHook} from '@testing-library/react';
import * as api from '../api';
import {CollectionItem, JobDefinition} from '../types';
import {useJob} from './useJob';

jest.mock('../api');

const mockNavigate = jest.fn();

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {...actual, useNavigate: () => mockNavigate};
});

describe('useJob', () => {
  const collections: CollectionItem[] = [
    {id: 'c1', name: 'Collection #1', state: 'enabled'},
    {id: 'c2', name: 'Collection #2', state: 'enabled'},
  ];
  const job: JobDefinition = {
    id: 'j1',
    name: 'Job #1',
    state: 'enabled',
    schedule: '* * * * *',
    collectionId: 'c2',
    action: {
      type: 'HTTP',
      request: {method: 'GET', uri: '', headers: [], body: ''},
      retryPolicy: {retryCount: 3, retryInterval: '10s', deadline: '1m'},
    },
    status: 'ready',
    updated: '2025-12-30T09:29:11.301',
    etag: 'W/"123"',
  };
  beforeEach(() => jest.clearAllMocks());

  it('handles retrieve job errors', async () => {
    jest.mocked(api.retrieveJob).mockRejectedValue(new Error('Unexpected'));
    jest.mocked(api.listCollections).mockResolvedValue({
      items: [{id: 'c1', name: 'Collection #1', state: 'enabled'}],
    });

    const {result} = await act(async () => renderHook(() => useJob('j1')));

    expect(api.retrieveJob).toHaveBeenCalledTimes(1);
    expect(result.current.pending).toBe(false);
    expect(result.current.errors.__ERROR__).toMatch(/Unexpected/);
  });

  it('retrieves job when id is provided', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.listCollections).mockResolvedValue({
      items: [{id: 'c1', name: 'Collection #1', state: 'enabled'}],
    });

    const {result} = await act(async () => renderHook(() => useJob('j1')));

    expect(api.retrieveJob).toHaveBeenCalledTimes(1);
    expect(api.retrieveJob).toHaveBeenCalledWith('j1');
    expect(api.listCollections).toHaveBeenCalledTimes(1);

    expect(result.current.item.id).toBe('j1');
    expect(result.current.item.name).toBe('Job #1');
    expect(result.current.pending).toBe(false);
  });

  it('sets a default collectionId when creating and collections exist', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({
      items: [{id: 'c1', name: 'Collection #1', state: 'enabled'}],
    });

    const {result} = await act(async () => renderHook(() => useJob()));

    expect(api.retrieveJob).not.toHaveBeenCalled();
    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(result.current.item.collectionId).toBe('c1');
    expect(result.current.errors.collectionId).toBeUndefined();
    expect(result.current.pending).toBe(false);
  });

  it('sets collectionId error when no collections exist', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({items: []});

    const {result} = await act(async () => renderHook(() => useJob()));

    expect(result.current.errors.collectionId).toMatch(/no collection/i);
  });

  it('does not override existing collectionId on item', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.listCollections).mockResolvedValue({
      items: collections,
    });

    const {result} = await act(async () => renderHook(() => useJob('j1')));

    expect(result.current.item.collectionId).toBe('c2');
    expect(result.current.errors.collectionId).toBeUndefined();
  });

  it('handles list collections errors', async () => {
    jest.mocked(api.listCollections).mockRejectedValue(new Error('Unexpected'));

    const {result} = await act(async () => renderHook(() => useJob()));

    expect(api.listCollections).toHaveBeenCalledTimes(1);
    expect(result.current.errors.__ERROR__).toMatch(/Unexpected/);
  });

  it('updates fields', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({items: []});

    const {result} = await act(async () => renderHook(() => useJob()));

    act(() => result.current.mutate((draft) => (draft.name = 'New name')));

    expect(result.current.item.name).toBe('New name');
  });

  it('saves and navigates on success', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.saveJob).mockResolvedValue();

    const {result} = await act(async () => renderHook(() => useJob()));

    await act(async () => result.current.save());

    expect(api.saveJob).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/jobs');
  });

  it('sets errors on save failure', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.saveJob).mockRejectedValue(new Error('Boom'));

    const {result} = await act(async () => renderHook(() => useJob()));

    await act(async () => result.current.save());

    expect(result.current.pending).toBe(false);
    expect(result.current.errors).toEqual(expect.any(Object));
  });

  it('does not remove when item has no id', async () => {
    jest.mocked(api.listCollections).mockResolvedValue({items: []});

    const {result} = await act(async () => renderHook(() => useJob()));

    await act(async () => result.current.remove());

    expect(api.deleteJob).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('removes and navigates with replace on success', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.deleteJob).mockResolvedValue();

    const {result} = await act(async () => renderHook(() => useJob('j1')));

    await act(async () => result.current.remove());

    expect(api.deleteJob).toHaveBeenCalledWith('j1', 'W/"123"');
    expect(mockNavigate).toHaveBeenCalledWith('/jobs', {replace: true});
  });

  it('sets errors on remove failure', async () => {
    jest.mocked(api.retrieveJob).mockResolvedValue(job);
    jest.mocked(api.listCollections).mockResolvedValue({items: []});
    jest.mocked(api.deleteJob).mockRejectedValue(new Error('Boom'));

    const {result} = await act(async () => renderHook(() => useJob('j1')));

    await act(async () => result.current.remove());

    expect(result.current.pending).toBe(false);
    expect(result.current.errors).toEqual(expect.any(Object));
  });
});
