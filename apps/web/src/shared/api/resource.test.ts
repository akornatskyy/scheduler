import {ApiResource} from './resource';

describe('ApiResource', () => {
  const createErrorFromResponse = jest.fn();
  const api = new ApiResource({
    baseURL: 'http://localhost:8080',
    createErrorFromResponse,
  });

  afterEach(() => jest.clearAllMocks());

  it('list() calls fetch with URL resolved against baseURL and returns items', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => ({items: [{id: 1}]}),
    });

    let result = await api.list<{id: number}>('/collections');

    expect(result).toEqual({items: [{id: 1}]});
    expect(global.fetch).toHaveBeenCalledWith(
      new URL('http://localhost:8080/collections'),
      {},
    );
    expect(createErrorFromResponse).not.toHaveBeenCalled();
  });

  it('get() returns [data, etag] and reads etag header', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => ({id: 123}),
      headers: {
        get: (key: string) => (key === 'etag' ? 'W/"x"' : null),
      },
    });

    let [data, etag] = await api.get<{id: number}>('/foo');

    expect(data).toEqual({id: 123});
    expect(etag).toBe('W/"x"');
    expect(global.fetch).toHaveBeenCalledWith(
      new URL('http://localhost:8080/foo'),
      {},
    );
    expect(createErrorFromResponse).not.toHaveBeenCalled();
  });

  it('post() sends JSON body and content-type and returns parsed response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => 'new-id',
    });

    const id = await api.post('/collections', {name: 'a'});

    expect(id).toBe('new-id');
    expect(global.fetch).toHaveBeenCalledWith(
      new URL('http://localhost:8080/collections'),
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({name: 'a'}),
      },
    );
    expect(createErrorFromResponse).not.toHaveBeenCalled();
  });

  it('patch() sends if-match when etag projestded', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => null,
    });

    await api.patch('/collections/1', {name: 'updated'}, 'etag-1');

    expect(global.fetch).toHaveBeenCalledWith(
      new URL('http://localhost:8080/collections/1'),
      {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'if-match': 'etag-1',
        },
        body: JSON.stringify({name: 'updated'}),
      },
    );
    expect(createErrorFromResponse).not.toHaveBeenCalled();
  });

  it('del() sends if-match when etag projestded', async () => {
    global.fetch = jest.fn().mockResolvedValue({ok: true});

    await api.delete('/collections/1', 'etag-x');

    expect(global.fetch).toHaveBeenCalledWith(
      new URL('http://localhost:8080/collections/1'),
      {
        method: 'DELETE',
        headers: {'if-match': 'etag-x'},
      },
    );
    expect(createErrorFromResponse).not.toHaveBeenCalled();
  });

  it('throws error mapped from createErrorFromResponse when response not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({ok: false});

    const err = new Error('mapped');
    const createErrorFromResponse = jest.fn().mockResolvedValue(err);

    const api = new ApiResource({
      baseURL: 'http://localhost:8080',
      createErrorFromResponse,
    });

    await expect(api.list('/abc')).rejects.toBe(err);
    expect(createErrorFromResponse).toHaveBeenCalledTimes(1);
  });
});
