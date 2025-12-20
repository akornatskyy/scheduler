import * as api from './http';

describe('jobs api', () => {
  afterEach(() => jest.mocked(global.fetch).mockClear());

  it('list', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const d = await api.listJobs();

    expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: [],
    });
    expect(global.fetch).toHaveBeenCalledWith('/jobs?fields=status,errorRate', {
      method: 'GET',
    });
  });

  it('list by collection id', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const d = await api.listJobs('123');

    expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: [],
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/jobs?fields=status,errorRate&collectionId=123',
      {
        method: 'GET',
      },
    );
  });
});
