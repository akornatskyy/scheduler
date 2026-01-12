import {type Errors, toErrorMap} from '$shared/errors';
import {useEffect, useState} from 'react';
import * as api from '../api';
import type {CollectionItem} from '../types';

export function useCollections() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [errors, setErrors] = useState<Errors>();

  useEffect(() => {
    (async () => {
      try {
        const {items} = await api.listCollections();
        setItems(items);
      } catch (error) {
        setErrors(toErrorMap(error));
      }
    })();
  }, []);

  return {items, errors};
}
