import {Errors, toErrorMap} from '$shared/errors';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import * as api from '../api';
import {CollectionInput} from '../types';

const INITIAL: CollectionInput = {
  name: '',
  state: 'enabled',
};

export function useCollection(id?: string) {
  const navigate = useNavigate();
  const [item, setItem] = useState<CollectionInput>(INITIAL);
  const [pending, setPending] = useState<boolean>(true);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const data = await api.retrieveCollection(id);
          setItem(data);
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

  const updateField = useCallback((name: string, value: string) => {
    setItem((prev) => ({...prev, [name]: value}));
  }, []);

  const save = useCallback(async () => {
    setPending(true);

    try {
      await api.saveCollection(item);
      navigate('/collections');
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [item, navigate]);

  const remove = useCallback(async () => {
    if (!item.id) return;

    setPending(true);

    try {
      await api.deleteCollection(item.id, item.etag);
      navigate('/collections', {replace: true});
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [item.id, item.etag, navigate]);

  return {
    item,
    pending,
    errors,
    updateField,
    save,
    remove,
  };
}
