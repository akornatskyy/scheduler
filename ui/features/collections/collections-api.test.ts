import * as api from './collections-api';

describe('collections api', () => {
  afterEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

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
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
  });
});
