import {Errors, toErrorMap} from '$shared/errors';
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
  const etagRef = useRef<string>(undefined);
  const [item, setItem] = useState<CollectionInput>(INITIAL);
  const [pending, setPending] = useState<boolean>(true);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const [data, etag] = await api.getCollection(id);
          setItem(toInput(data));
          etagRef.current = etag;
        } catch (error) {
          setErrors(toErrorMap(error));
        } finally {
          setPending(false);
        }
      })();
      return;
    }

    setPending(false);
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
    setPending(true);

    try {
      if (id) {
        await api.updateCollection(id, item, etagRef.current);
      } else {
        await api.createCollection(item);
      }

      navigate('/collections');
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [item, id, navigate]);

  const remove = useCallback(async () => {
    if (!id) return;

    setPending(true);

    try {
      await api.deleteCollection(id, etagRef.current);
      navigate('/collections', {replace: true});
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [id, navigate]);

  return {item, pending, errors, mutate, save, remove};
}

const toInput = (data: Collection): CollectionInput => {
  const {name, state} = data;
  return {name, state};
};
