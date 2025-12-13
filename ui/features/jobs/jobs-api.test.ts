import * as api from './jobs-api';

describe('jobs api', () => {
  afterEach(() => {
    (global.fetch as jest.Mock).mockClear();
    delete (global as {fetch?: typeof fetch}).fetch;
  });

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
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
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
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    );
  });
});
