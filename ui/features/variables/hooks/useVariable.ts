import {Errors, toErrorMap} from '$shared/errors';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import * as api from '../api';
import {CollectionItem, VariableInput} from '../types';

const INITIAL: VariableInput = {
  name: '',
  collectionId: '',
  value: '',
};

export function useVariable(id?: string) {
  const navigate = useNavigate();
  const [item, setItem] = useState<VariableInput>(INITIAL);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [pending, setPending] = useState<boolean>(true);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const data = await api.retrieveVariable(id);
          setItem(data);
        } catch (error) {
          setErrors(toErrorMap(error));
        } finally {
          setPending(false);
        }
      })();
    } else {
      setItem(INITIAL);
      setPending(false);
    }

    (async () => {
      try {
        const {items} = await api.listCollections();
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

  const updateField = useCallback((name: string, value: string) => {
    setItem((prev) => ({...prev, [name]: value}));
  }, []);

  const save = useCallback(async () => {
    setPending(true);

    try {
      await api.saveVariable(item);
      navigate('/variables');
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [item, navigate]);

  const remove = useCallback(async () => {
    if (!item.id) return;

    setPending(true);

    try {
      await api.deleteVariable(item.id, item.etag);
      navigate('/variables', {replace: true});
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [item.id, item.etag, navigate]);

  return {collections, item, pending, errors, updateField, save, remove};
}
