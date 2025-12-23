import {Errors, toErrorMap} from '$shared/errors';
import {useEffect, useState} from 'react';
import * as api from '../api';
import {CollectionItem, VariableItem} from '../types';

export function useVariables(collectionId?: string | null) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [variables, setVariables] = useState<VariableItem[]>([]);
  const [errors, setErrors] = useState<Errors>();

  useEffect(() => {
    (async () => {
      try {
        const [{items: collections}, {items: variables}] = await Promise.all([
          api.listCollections(),
          api.listVariables(collectionId),
        ]);

        setCollections(collections);
        setVariables(variables);
      } catch (error) {
        setErrors(toErrorMap(error));
      }
    })();
  }, [collectionId]);

  return {collections, variables, errors};
}
