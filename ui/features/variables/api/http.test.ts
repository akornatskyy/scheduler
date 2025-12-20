import * as api from './http';

describe('variables api', () => {
  afterEach(() => jest.mocked(global.fetch).mockClear());

  it('list', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const d = await api.listVariables();

    expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: [],
    });
    expect(global.fetch).toHaveBeenCalledWith('/variables', {
      method: 'GET',
    });
  });

  it('list by collection id', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: {get: () => '"2hhaswzbz72p8"'},
      json: () => Promise.resolve({items: []}),
    });

    const d = await api.listVariables('123');

    expect(d).toEqual({
      etag: '"2hhaswzbz72p8"',
      items: [],
    });
    expect(global.fetch).toHaveBeenCalledWith('/variables?collectionId=123', {
      method: 'GET',
    });
  });
});
