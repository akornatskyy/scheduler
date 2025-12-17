import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {Layout} from '$shared/components';
import {Errors} from '$shared/types';
import {Collection, Variable} from './types';
import * as api from './variable-api';
import {VariableForm} from './variable-components';

const INITIAL: Variable = {
  collectionId: '',
  name: '',
  value: '',
};

export default function VariableContainer() {
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();
  const [item, setItem] = useState<Variable>(INITIAL);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pending, setPending] = useState<boolean>(true);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      api
        .retrieveVariable(id)
        .then((item) => {
          setItem(item);
          setPending(false);
        })
        .catch((errors) => {
          setErrors(errors);
          setPending(false);
        });
      return;
    }

    setItem(INITIAL);
    setPending(false);
  }, [id]);

  useEffect(() => {
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
  }, []);

  const handleChange = useCallback((name: string, value: string) => {
    setItem((prev) => ({...prev, [name]: value}));
  }, []);

  const handleSave = useCallback(() => {
    setPending(true);
    api
      .saveVariable(item)
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
      .deleteVariable(id, etag)
      .then(() => navigate(-1))
      .catch((errors) => {
        setErrors(errors);
        setPending(false);
      });
  }, [item, navigate]);

  return (
    <Layout title={`Variable ${item.name}`} errors={errors}>
      <VariableForm
        item={item}
        collections={collections}
        pending={pending}
        errors={errors}
        onChange={handleChange}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
