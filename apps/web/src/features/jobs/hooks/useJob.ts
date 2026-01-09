import {api as collectionsApi} from '$features/collections';
import {Errors, toErrorMap} from '$shared/errors';
import {diffPartial} from '$shared/utils';
import {produce} from 'immer';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import * as api from '../api';
import {CollectionItem, JobDefinition, JobInput} from '../types';

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
  const intialRef = useRef(INITIAL);
  const etagRef = useRef<string>(undefined);
  const [item, setItem] = useState<JobInput>(INITIAL);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const [data, etag] = await api.getJob(id);
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
    (recipe: (input: JobInput) => void) =>
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
          await api.updateJob(id, delta, etagRef.current);
        }
      } else {
        await api.createJob(item);
      }

      navigate('/jobs');
    } catch (error) {
      setErrors(toErrorMap(error));
    }
  }, [item, id, navigate]);

  const remove = useCallback(async () => {
    if (!id) return;

    try {
      await api.deleteJob(id, etagRef.current);
      navigate('/jobs', {replace: true});
    } catch (error) {
      setErrors(toErrorMap(error));
    }
  }, [id, navigate]);

  return {collections, item, errors, mutate, save, remove};
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
      request: {
        ...{method: 'GET', uri: '', headers: [], body: ''},
        ...action.request,
      },
      retryPolicy: {
        ...{retryCount: 3, retryInterval: '10s', deadline: '1m'},
        ...action.retryPolicy,
      },
    },
  };
};
