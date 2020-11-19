import React from 'react';
import {Link} from 'react-router-dom';
import {Form, Button} from 'react-bootstrap';

import {FieldError, Tip} from '../../shared/components';

export const CollectionForm = ({
  item, pending, errors, onChange, onSave, onDelete
}) => {
  const handleChange = ({target: {name, value}}) => onChange?.(name, value);
  return (
    <Form autoComplete="off" role="form" onSubmit={(e) => {
      e.preventDefault();
      onSave?.();
    }}>
      <Form.Group controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control
          name="name"
          required
          placeholder="Name"
          type="text"
          value={item.name}
          isInvalid={!!errors.name}
          onChange={handleChange} />
        <FieldError message={errors.name} />
      </Form.Group>
      <Form.Group controlId="state">
        <Form.Check
          id="stateEnabled"
          name="state"
          inline
          label="Enabled"
          type="radio"
          value="enabled"
          checked={item.state === 'enabled'}
          isInvalid={!!errors.state}
          onChange={handleChange} />
        <Form.Check
          id="stateDisabled"
          name="state"
          inline
          label="Disabled"
          type="radio"
          value="disabled"
          checked={item.state === 'disabled'}
          isInvalid={!!errors.state}
          onChange={handleChange} />
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
          <Button
            as={Link}
            to={`/variables?collectionId=${item.id}`}
            variant="outline-secondary"
            disabled={pending}
            className="ml-2">
            Variables
          </Button>
          <Button
            as={Link}
            to={`/jobs?collectionId=${item.id}`}
            variant="outline-secondary"
            disabled={pending}
            className="ml-2">
            Jobs
          </Button>
          <Button
            onClick={onDelete}
            variant="danger"
            className="float-right"
            disabled={pending}>
            Delete
          </Button>
        </>
      )}
    </Form>
  );
};
