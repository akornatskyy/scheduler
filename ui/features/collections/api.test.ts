import * as api from './api';

describe('collections api', () => {
  afterEach(() => jest.mocked(global.fetch).mockClear());

  it('list', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const d = await api.listCollections();

    expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: [],
    });
    expect(global.fetch).toHaveBeenCalledWith('/collections', {
      method: 'GET',
    });
  });
});
