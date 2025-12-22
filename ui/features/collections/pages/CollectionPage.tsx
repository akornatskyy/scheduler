import {Layout} from '$shared/components';
import {Errors, toErrorMap} from '$shared/errors';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import * as api from '../api';
import {CollectionForm} from '../components/CollectionForm';
import {CollectionInput} from '../types';

const INITIAL: CollectionInput = {
  name: '',
  state: 'enabled',
};

export function CollectionPage() {
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();
  const [item, setItem] = useState<CollectionInput>(INITIAL);
  const [pending, setPending] = useState<boolean>(true);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const data = await api.retrieveCollection(id);
          setItem(data);
          setPending(false);
        } catch (error) {
          setErrors(toErrorMap(error));
          setPending(false);
        }
      })();
      return;
    }

    setPending(false);
  }, [id]);

  const handleChange = useCallback((name: string, value: string) => {
    setItem((prev) => ({...prev, [name]: value}));
  }, []);

  const handleSave = useCallback(async () => {
    setPending(true);

    try {
      await api.saveCollection(item);
      navigate('/collections');
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [item, navigate]);

  const handleDelete = useCallback(async () => {
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

  return (
    <Layout title={`Collection ${item.name}`} errors={errors}>
      <CollectionForm
        item={item}
        pending={pending}
        errors={errors}
        onChange={handleChange}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
