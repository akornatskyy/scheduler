import update from 'immutability-helper';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {Layout} from '$shared/components';
import {Errors} from '$shared/types';
import * as api from './job-api';
import {JobForm} from './job-components';
import {Collection, JobInput} from './types';

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

export default function JobContainer() {
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();
  const [item, setItem] = useState<JobInput>(INITIAL);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pending, setPending] = useState(true);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      setPending(true);
      api
        .retrieveJob(id)
        .then((item) => {
          setItem(item);
          setPending(false);
        })
        .catch((errors) => {
          setErrors(errors);
          setPending(false);
        });
    } else {
      setPending(false);
    }

    api
      .listCollections()
      .then(({items}) => {
        setCollections(items);
        setItem((prev) => {
          if (prev.collectionId) return prev;
          if (items.length > 0) return {...prev, collectionId: items[0].id};
          setErrors({collectionId: 'There is no collection available.'});
          return prev;
        });
      })
      .catch((errors) => setErrors(errors));
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

  const handleSave = useCallback(() => {
    setPending(true);
    api
      .saveJob(item)
      .then(() => navigate(-1))
      .catch((errors) => {
        setErrors(errors);
        setPending(false);
      });
  }, [item, navigate]);

  const handleDelete = useCallback(() => {
    const {id, etag} = item;
    if (!id) return;
    setPending(true);
    api
      .deleteJob(id, etag)
      .then(() => navigate(-1))
      .catch((errors) => {
        setErrors(errors);
        setPending(false);
      });
  }, [item, navigate]);

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
