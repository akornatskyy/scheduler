import {Layout} from '$shared/components';
import {Errors, toErrorMap} from '$shared/errors';
import update from 'immutability-helper';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import * as api from './api';
import {JobForm} from './components/JobForm';
import {CollectionItem, JobInput} from './types';

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

export function JobPage() {
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();
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
          setPending(false);
        } catch (error) {
          setErrors(toErrorMap(error));
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

  const handleItemChange = useCallback((name: string, value: string) => {
    setItem((prev) => ({...prev, [name]: value}));
  }, []);

  const handleActionChange = useCallback((name: string, value: string) => {
    setItem((prev) => update(prev, {action: {[name]: {$set: value}}}));
  }, []);

  const handleRequestChange = useCallback((name: string, value: string) => {
    setItem((prev) =>
      update(prev, {action: {request: {[name]: {$set: value}}}}),
    );
  }, []);

  const handlePolicyChange = useCallback(
    (name: string, value: string | number) => {
      setItem((prev) =>
        update(prev, {action: {retryPolicy: {[name]: {$set: value}}}}),
      );
    },
    [],
  );

  const handleHeaderChange = useCallback(
    (name: string, value: string, i: number) => {
      setItem((prev) =>
        update(prev, {
          action: {request: {headers: {[i]: {[name]: {$set: value}}}}},
        }),
      );
    },
    [],
  );

  const handleAddHeader = useCallback(() => {
    setItem((prev) =>
      update(prev, {
        action: {request: {headers: {$push: [{name: '', value: ''}]}}},
      }),
    );
  }, []);

  const handleDeleteHeader = useCallback((i: number) => {
    setItem((prev) =>
      update(prev, {
        action: {request: {headers: {$splice: [[i, 1]]}}},
      }),
    );
  }, []);

  const handleSave = useCallback(async () => {
    setPending(true);

    try {
      await api.saveJob(item);
      navigate('/jobs');
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [item, navigate]);

  const handleDelete = useCallback(async () => {
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

  return (
    <Layout title={`Job ${item.name}`} errors={errors}>
      <JobForm
        item={item}
        collections={collections}
        pending={pending}
        errors={errors}
        onItemChange={handleItemChange}
        onActionChange={handleActionChange}
        onRequestChange={handleRequestChange}
        onPolicyChange={handlePolicyChange}
        onHeaderChange={handleHeaderChange}
        onAddHeader={handleAddHeader}
        onDeleteHeader={handleDeleteHeader}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
