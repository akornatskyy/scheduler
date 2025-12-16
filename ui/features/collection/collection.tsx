import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Layout} from '$shared/components';
import {Errors} from '$shared/types';
import * as api from './collection-api';
import {CollectionForm} from './collection-components';
import {Collection} from './types';

const INITIAL: Collection = {
  name: '',
  state: 'enabled',
};

export default function CollectionContainer() {
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();
  const [item, setItem] = useState<Collection>(INITIAL);
  const [pending, setPending] = useState<boolean>(true);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      api
        .retrieveCollection(id)
        .then((data) => {
          setItem(data);
          setPending(false);
        })
        .catch((errors) => {
          setErrors(errors);
          setPending(false);
        });
      return;
    }

    setPending(false);
  }, [id]);

  const handleChange = useCallback((name: string, value: string) => {
    setItem((prev) => ({...prev, [name]: value}));
  }, []);

  const handleSave = useCallback(() => {
    setPending(true);
    api
      .saveCollection(item)
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
      .deleteCollection(id, etag)
      .then(() => navigate(-1))
      .catch((errors) => {
        setErrors(errors);
        setPending(false);
      });
  }, [item, navigate]);

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
