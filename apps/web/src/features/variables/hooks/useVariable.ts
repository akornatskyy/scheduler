import {api as collectionsApi} from '$features/collections';
import {Errors, toErrorMap} from '$shared/errors';
import {diffPartial} from '$shared/utils';
import {produce} from 'immer';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import * as api from '../api';
import {checkVariableInput} from '../checks';
import {CollectionItem, Variable, VariableInput} from '../types';

const INITIAL: VariableInput = {
  name: '',
  collectionId: '',
  value: '',
};

export function useVariable(id?: string) {
  const navigate = useNavigate();
  const intialRef = useRef(INITIAL);
  const etagRef = useRef<string>(undefined);
  const [item, setItem] = useState<VariableInput>(INITIAL);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const [data, etag] = await api.getVariable(id);
          const input = toInput(data);
          setItem(input);
          intialRef.current = input;
          etagRef.current = etag;
        } catch (error) {
          setErrors(toErrorMap(error));
        }
      })();
    }

    (async () => {
      try {
        const {items} = await collectionsApi.listCollections();
        setCollections(items);
        setItem((prev) => {
          if (prev.collectionId) return prev;
          if (items.length > 0) return {...prev, collectionId: items[0].id};
          setErrors({collectionId: 'There is no collection available.'});
          return prev;
        });
      } catch (error) {
        setErrors(toErrorMap(error));
      }
    })();
  }, [id]);

  const mutate = useCallback(
    (recipe: (input: VariableInput) => void) =>
      setItem(
        produce((draft) => {
          recipe(draft);
        }),
      ),
    [],
  );

  const save = useCallback(async () => {
    if (!checkVariableInput(item, setErrors)) return;

    try {
      if (id) {
        const delta = diffPartial(intialRef.current, item);
        if (delta) {
          await api.updateVariable(id, delta, etagRef.current);
        }
      } else {
        await api.createVariable(item);
      }

      navigate('/variables');
    } catch (error) {
      setErrors(toErrorMap(error));
    }
  }, [item, id, navigate]);

  const remove = useCallback(async () => {
    if (!id) return;

    try {
      await api.deleteVariable(id, etagRef.current);
      navigate('/variables', {replace: true});
    } catch (error) {
      setErrors(toErrorMap(error));
    }
  }, [id, navigate]);

  return {collections, item, errors, mutate, save, remove};
}

const toInput = (data: Variable): VariableInput => {
  const {name, collectionId, value} = data;
  return {name, collectionId, value};
};
