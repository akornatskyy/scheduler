import {Errors, toErrorMap} from '$shared/errors';
import {diffPartial} from '$shared/utils';
import {produce} from 'immer';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import * as api from '../api';
import {Collection, CollectionInput} from '../types';

const INITIAL: CollectionInput = {
  name: '',
  state: 'enabled',
};

export function useCollection(id?: string) {
  const navigate = useNavigate();
  const intialRef = useRef(INITIAL);
  const etagRef = useRef<string>(undefined);
  const [item, setItem] = useState<CollectionInput>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [data, etag] = await api.getCollection(id);
        const input = toInput(data);
        setItem(input);
        intialRef.current = input;
        etagRef.current = etag;
      } catch (error) {
        setErrors(toErrorMap(error));
      }
    })();
  }, [id]);

  const mutate = useCallback(
    (recipe: (input: CollectionInput) => void) =>
      setItem(
        produce((draft) => {
          recipe(draft);
        }),
      ),
    [],
  );

  const save = useCallback(async () => {
    try {
      if (id) {
        const delta = diffPartial(intialRef.current, item);
        if (delta) {
          await api.updateCollection(id, delta, etagRef.current);
        }
      } else {
        await api.createCollection(item);
      }

      navigate('/collections');
    } catch (error) {
      setErrors(toErrorMap(error));
    }
  }, [item, id, navigate]);

  const remove = useCallback(async () => {
    if (!id) return;

    try {
      await api.deleteCollection(id, etagRef.current);
      navigate('/collections', {replace: true});
    } catch (error) {
      setErrors(toErrorMap(error));
    }
  }, [id, navigate]);

  return {item, errors, mutate, save, remove};
}

const toInput = (data: Collection): CollectionInput => {
  const {name, state} = data;
  return {name, state};
};
