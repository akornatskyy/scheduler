import React from 'react';
import {Button, Form} from 'react-bootstrap';
import {Link} from 'react-router';
import {FieldError, Tip} from '$shared/components';
import {Collection} from './types';

type Errors = Record<string, string>;

type Props = {
  item: Collection;
  pending: boolean;
  errors: Errors;
  onChange?: (name: string, value: string) => void;
  onSave?: () => void;
  onDelete?: () => void;
};

export const CollectionForm = ({
  item,
  pending,
  errors,
  onChange,
  onSave,
  onDelete,
}: Props): React.ReactElement => {
  const handleChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLInputElement>) => onChange?.(name, value);
  return (
    <Form
      autoComplete="off"
      role="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave?.();
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
          onChange={handleChange}
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
          onChange={handleChange}
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
          onChange={handleChange}
        />
        <FieldError message={errors.state} />
      </Form.Group>
      <Tip>
        If you disable a collection, all related jobs will be inherently
        inactive as well.
      </Tip>
      <Button type="submit" disabled={pending}>
        Save
      </Button>
      {item.id && (
        <>
          <Link
            to={`/variables?collectionId=${item.id}`}
            className={`btn btn-outline-secondary mx-2${
              pending ? ' disabled' : ''
            }`}
            aria-disabled={pending}
            tabIndex={pending ? -1 : 0}
            onClick={pending ? (e) => e.preventDefault() : undefined}
          >
            Variables
          </Link>
          <Link
            to={`/jobs?collectionId=${item.id}`}
            className={`btn btn-outline-secondary${pending ? ' disabled' : ''}`}
            aria-disabled={pending}
            tabIndex={pending ? -1 : 0}
            onClick={pending ? (e) => e.preventDefault() : undefined}
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
};
