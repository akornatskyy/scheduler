import {FieldError, Mutate, Tip} from '$shared/components';
import {Errors} from '$shared/errors';
import {Button, Form} from 'react-bootstrap';
import {Link} from 'react-router';
import {CollectionInput} from '../types';

type Props = {
  id?: string;
  item: CollectionInput;
  pending: boolean;
  errors: Errors;
  mutate: Mutate<CollectionInput>;
  onSave: () => void;
  onDelete: () => void;
};

export const CollectionForm = ({
  id,
  item,
  pending,
  errors,
  mutate,
  onSave,
  onDelete,
}: Props) => (
  <Form
    autoComplete="off"
    role="form"
    onSubmit={(e) => {
      e.preventDefault();
      onSave();
    }}
  >
    <Form.Group controlId="name" className="mb-3">
      <Form.Label>Name</Form.Label>
      <Form.Control
        name="name"
        required
        placeholder="Name"
        type="text"
        value={item.name}
        isInvalid={!!errors.name}
        onChange={(e) => mutate((d) => (d.name = e.target.value))}
      />
      <FieldError message={errors.name} />
    </Form.Group>
    <Form.Group controlId="state" className="mb-3">
      <Form.Check
        id="stateEnabled"
        name="state"
        inline
        label="Enabled"
        type="radio"
        value="enabled"
        checked={item.state === 'enabled'}
        isInvalid={!!errors.state}
        onChange={() => mutate((d) => (d.state = 'enabled'))}
      />
      <Form.Check
        id="stateDisabled"
        name="state"
        inline
        label="Disabled"
        type="radio"
        value="disabled"
        checked={item.state === 'disabled'}
        isInvalid={!!errors.state}
        onChange={() => mutate((d) => (d.state = 'disabled'))}
      />
      <FieldError message={errors.state} />
    </Form.Group>
    <Tip>
      If you disable a collection, all related jobs will be inherently inactive
      as well.
    </Tip>
    <Button type="submit" disabled={pending}>
      Save
    </Button>
    {id && (
      <>
        <Link
          to={`/variables?collectionId=${id}`}
          className="btn btn-outline-secondary mx-2"
        >
          Variables
        </Link>
        <Link
          to={`/jobs?collectionId=${id}`}
          className="btn btn-outline-secondary"
        >
          Jobs
        </Link>
        <Button
          onClick={onDelete}
          variant="danger"
          className="float-end"
          disabled={pending}
        >
          Delete
        </Button>
      </>
    )}
  </Form>
);
