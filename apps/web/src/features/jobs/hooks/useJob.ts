import {api as collectionsApi} from '$features/collections';
import {Errors, toErrorMap} from '$shared/errors';
import {produce} from 'immer';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import * as api from '../api';
import {
  CollectionItem,
  HttpRequest,
  JobDefinition,
  JobInput,
  RetryPolicy,
} from '../types';

const INITIAL: JobInput = {
  name: '',
  state: 'enabled',
  schedule: '',
  collectionId: '',
  action: {
    type: 'HTTP',
    request: {method: 'GET', uri: '', headers: [], body: ''},
    retryPolicy: {retryCount: 3, retryInterval: '10s', deadline: '1m'},
  },
};

export function useJob(id?: string) {
  const navigate = useNavigate();
  const etagRef = useRef<string>(undefined);
  const [item, setItem] = useState<JobInput>(INITIAL);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [pending, setPending] = useState(true);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const [data, etag] = await api.getJob(id);
          setItem(toInput(data));
          etagRef.current = etag;
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
      if (id) {
        await api.updateJob(id, item, etagRef.current);
      } else {
        await api.createJob(item);
      }

      navigate('/jobs');
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [item, id, navigate]);

  const remove = useCallback(async () => {
    if (!id) return;

    setPending(true);

    try {
      await api.deleteJob(id, etagRef.current);
      navigate('/jobs', {replace: true});
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [id, navigate]);

  return {collections, item, pending, errors, mutate, save, remove};
}

const toInput = (data: JobDefinition): JobInput => {
  const {name, collectionId, state, schedule, action} = data;
  return {
    name,
    collectionId,
    state,
    schedule,
    action: {
      type: 'HTTP',
      request: {...DefaultRequest, ...action.request},
      retryPolicy: {...DefaultRetryPolicy, ...action.retryPolicy},
    },
  };
};

const DefaultRequest: HttpRequest = {
  method: 'GET',
  uri: '',
  headers: [],
  body: '',
};

const DefaultRetryPolicy: RetryPolicy = {
  retryCount: 3,
  retryInterval: '10s',
  deadline: '1m',
};
