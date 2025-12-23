import {Errors, toErrorMap} from '$shared/errors';
import update from 'immutability-helper';
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

  const updateItem = useCallback((name: string, value: string) => {
    setItem((prev) => ({...prev, [name]: value}));
  }, []);

  const updateAction = useCallback((name: string, value: string) => {
    setItem((prev) => update(prev, {action: {[name]: {$set: value}}}));
  }, []);

  const updateRequest = useCallback((name: string, value: string) => {
    setItem((prev) =>
      update(prev, {action: {request: {[name]: {$set: value}}}}),
    );
  }, []);

  const updatePolicy = useCallback((name: string, value: string | number) => {
    setItem((prev) =>
      update(prev, {action: {retryPolicy: {[name]: {$set: value}}}}),
    );
  }, []);

  const updateHeader = useCallback((name: string, value: string, i: number) => {
    setItem((prev) =>
      update(prev, {
        action: {request: {headers: {[i]: {[name]: {$set: value}}}}},
      }),
    );
  }, []);

  const addHeader = useCallback(() => {
    setItem((prev) =>
      update(prev, {
        action: {request: {headers: {$push: [{name: '', value: ''}]}}},
      }),
    );
  }, []);

  const removeHeader = useCallback((i: number) => {
    setItem((prev) =>
      update(prev, {
        action: {request: {headers: {$splice: [[i, 1]]}}},
      }),
    );
  }, []);

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
    updateItem,
    updateAction,
    updateRequest,
    updatePolicy,
    updateHeader,
    addHeader,
    removeHeader,
    save,
    remove,
  };
}
