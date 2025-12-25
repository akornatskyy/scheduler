import {Errors, toErrorMap} from '$shared/errors';
import {produce} from 'immer';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import * as api from '../api';
import {CollectionItem, JobInput} from '../types';

const INITIAL: JobInput = {
  name: '',
  state: 'enabled',
  schedule: '',
  collectionId: '',
  action: {
    type: 'HTTP',
    request: {
      method: 'GET',
      uri: '',
      headers: [],
      body: '',
    },
    retryPolicy: {
      retryCount: 3,
      retryInterval: '10s',
      deadline: '1m',
    },
  },
};

export function useJob(id?: string) {
  const navigate = useNavigate();
  const [item, setItem] = useState<JobInput>(INITIAL);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [pending, setPending] = useState(true);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const data = await api.retrieveJob(id);
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

  const mutate = useCallback(
    (recipe: (input: JobInput) => void) =>
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
      await api.saveJob(item);
      navigate('/jobs');
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [item, navigate]);

  const remove = useCallback(async () => {
    if (!item.id) return;

    setPending(true);

    try {
      await api.deleteJob(item.id, item.etag);
      navigate('/jobs', {replace: true});
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [item.id, item.etag, navigate]);

  return {
    collections,
    item,
    pending,
    errors,
    mutate,
    save,
    remove,
  };
}
