import {client} from '$shared/api';
import type {Variable, VariableInput, VariableItem} from '../types';

type ListVariablesParams = {
  collectionId?: string | null;
};

export const listVariables = (params: ListVariablesParams) =>
  client.list<VariableItem>(
    params.collectionId
      ? `/variables?collectionId=${params.collectionId}`
      : '/variables',
  );

export const getVariable = (id: string) =>
  client.get<Variable>(`/variables/${id}`);

export const createVariable = (data: VariableInput) =>
  client.post('/variables', data);

export const updateVariable = (
  id: string,
  data: Partial<VariableInput>,
  etag?: string,
) => client.patch(`/variables/${id}`, data, etag);

export const deleteVariable = (id: string, etag?: string) =>
  client.delete(`/variables/${id}`, etag);
