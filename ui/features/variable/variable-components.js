import React from 'react';
import {Form, Button, Col} from 'react-bootstrap';

import {FieldError, Tip} from '../../shared/components';

export const VariableForm = ({
  item, collections, pending, errors, onChange, onSave, onDelete
}) => {
  const handleChange = ({target: {name, value}}) => onChange?.(name, value);
  return (
    <Form autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        onSave?.();
      }}>
      <Form.Row>
        <Form.Group as={Col} controlId="name">
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
        <Form.Group as={Col} controlId="collectionId">
          <Form.Label>Collection</Form.Label>
          <Form.Control
            name="collectionId"
            required
            as="select"
            value={item.collectionId}
            isInvalid={!!errors.collectionId}
            onChange={handleChange}>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Form.Control>
          <FieldError message={errors.collectionId} />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} controlId="value">
          <Form.Label>Value</Form.Label>
          <Form.Control
            as="textarea"
            rows="5"
            name="value"
            value={item.value}
            isInvalid={!!errors.value}
            onChange={handleChange} />
          <FieldError message={errors.value} />
        </Form.Group>
      </Form.Row>
      <Tip>
        You can override environment variable, e.g.
        variable <i>HOST</i> overrides
        environment variable <i>SCHEDULER_HOST</i>, etc.
      </Tip>
      <Button type="submit" disabled={pending}>
        Save
      </Button>
      {item.id && (
        <Button
          onClick={onDelete}
          variant="danger"
          className="float-right"
          disabled={pending}>
          Delete
        </Button>
      )}
    </Form>
  );
};
