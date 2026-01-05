import {FieldError, Mutate, Tip} from '$shared/components';
import {Errors} from '$shared/errors';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {CollectionItem, VariableInput} from '../types';

type Props = {
  id?: string;
  item: VariableInput;
  collections: CollectionItem[];
  pending: boolean;
  errors: Errors;
  mutate: Mutate<VariableInput>;
  onSave: () => void;
  onDelete: () => void;
};

export const VariableForm = ({
  id,
  item,
  collections,
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
    <Row className="mb-3">
      <Form.Group as={Col} controlId="name">
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
      <Form.Group as={Col} controlId="collectionId">
        <Form.Label>Collection</Form.Label>
        <Form.Control
          name="collectionId"
          required
          as="select"
          value={item.collectionId}
          isInvalid={!!errors.collectionId}
          onChange={(e) => mutate((d) => (d.collectionId = e.target.value))}
        >
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Form.Control>
        <FieldError message={errors.collectionId} />
      </Form.Group>
    </Row>
    <Row className="mb-3">
      <Form.Group as={Col} controlId="value">
        <Form.Label>Value</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          name="value"
          value={item.value}
          isInvalid={!!errors.value}
          onChange={(e) => mutate((d) => (d.value = e.target.value))}
        />
        <FieldError message={errors.value} />
      </Form.Group>
    </Row>
    <Tip>
      You can override environment variable, e.g. variable <i>HOST</i> overrides
      environment variable <i>SCHEDULER_HOST</i>, etc.
    </Tip>
    <Button type="submit" disabled={pending}>
      Save
    </Button>
    {id && (
      <Button
        onClick={onDelete}
        variant="danger"
        className="float-end"
        disabled={pending}
      >
        Delete
      </Button>
    )}
  </Form>
);
