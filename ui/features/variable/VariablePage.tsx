import {Layout} from '$shared/components';
import {Errors, toErrorMap} from '$shared/errors';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {Collection, Variable} from './types';
import * as api from './api';
import {VariableForm} from './components/VariableForm';

const INITIAL: Variable = {
  collectionId: '',
  name: '',
  value: '',
};

export function VariablePage() {
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();
  const [item, setItem] = useState<Variable>(INITIAL);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pending, setPending] = useState<boolean>(true);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const data = await api.retrieveVariable(id);
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

  const handleChange = useCallback((name: string, value: string) => {
    setItem((prev) => ({...prev, [name]: value}));
  }, []);

  const handleSave = useCallback(async () => {
    setPending(true);

    try {
      await api.saveVariable(item);
      navigate('/variables');
    } catch (error) {
      setErrors(toErrorMap(error));
      setPending(false);
    }
  }, [item, navigate]);

  const handleDelete = useCallback(async () => {
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
