import {client} from '$shared/api';
import type {
  GetResourceResponse,
  ListResourceResponse,
} from '$shared/lib/resource';
import type {Variable, VariableInput, VariableItem} from '../types';
import * as api from './http';

jest.mock('$shared/api');

describe('variables api', () => {
  const item = {id: '123'} as Variable;

  beforeEach(() => jest.clearAllMocks());

  it('listVariables() calls client.list with /variables', async () => {
    const payload: ListResourceResponse<VariableItem> = {
      items: [item],
    };
    jest.mocked(client).list.mockResolvedValue(payload);

    const result = await api.listVariables({});

    expect(result).toBe(payload);
    expect(client.list).toHaveBeenCalledWith('/variables');
  });

  it('listVariables() calls client.list with /variables?collectionId=:id when collectionId is provided', async () => {
    const payload: ListResourceResponse<VariableItem> = {
      items: [item],
    };
    jest.mocked(client).list.mockResolvedValue(payload);

    const result = await api.listVariables({collectionId: 'c1'});

    expect(result).toBe(payload);
    expect(client.list).toHaveBeenCalledWith('/variables?collectionId=c1');
  });

  it('getVariable() calls client.get with /variables/:id', async () => {
    const payload: GetResourceResponse<Variable> = [item, 'W/"1"'];
    jest.mocked(client).get.mockResolvedValue(payload);

    const result = await api.getVariable('v1');

    expect(result).toBe(payload);
    expect(client.get).toHaveBeenCalledWith('/variables/v1');
  });

  it('createVariable() calls client.post with /variables', async () => {
    const input: VariableInput = {name: 'var1'} as VariableInput;
    jest.mocked(client).post.mockResolvedValue('new-id');

    const id = await api.createVariable(input);

    expect(id).toBe('new-id');
    expect(client.post).toHaveBeenCalledWith('/variables', input);
  });

  it('updateVariable() calls client.patch with /variables/:id', async () => {
    const input: Partial<VariableInput> = {name: 'New Name'};

    await api.updateVariable('v1', input, 'W/"1"');

    expect(client.patch).toHaveBeenCalledWith('/variables/v1', input, 'W/"1"');
  });

  it('deleteVariable() calls client.del with /variables/:id', async () => {
    await api.deleteVariable('v1', 'W/"2"');

    expect(client.delete).toHaveBeenCalledWith('/variables/v1', 'W/"2"');
  });
});
