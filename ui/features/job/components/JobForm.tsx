import {FieldError, Tip} from '$shared/components';
import {Errors} from '$shared/errors';
import React from 'react';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {Link} from 'react-router';
import {
  Collection,
  HttpRequest,
  HttpRequestHeader,
  JobInput,
  RetryPolicy,
} from '../types';

type Props = {
  item: JobInput;
  collections: Collection[];
  pending: boolean;
  errors: Errors;
  onItemChange?: (name: string, value: string) => void;
  onActionChange?: (name: string, value: string) => void;
  onRequestChange?: (name: string, value: string) => void;
  onPolicyChange?: (name: string, value: string | number) => void;
  onHeaderChange?: (name: string, value: string, i: number) => void;
  onAddHeader?: () => void;
  onDeleteHeader?: (i: number) => void;
  onSave?: () => void;
  onDelete?: () => void;
};

const httpMethodsWithBody = ['POST', 'PUT', 'PATCH'];

export const JobForm = ({
  item,
  collections,
  pending,
  errors,
  onItemChange,
  onActionChange,
  onRequestChange,
  onPolicyChange,
  onHeaderChange,
  onAddHeader,
  onDeleteHeader,
  onSave,
  onDelete,
}: Props) => {
  const handleItemChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLInputElement>) => {
    onItemChange?.(name, value);
  };

  const handleActionChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLSelectElement>) => {
    onActionChange?.(name, value);
  };

  const handleRequestChange = ({
    target: {name, value},
  }: React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >) => {
    onRequestChange?.(name, value);
  };

  const handlePolicyChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLInputElement>) => {
    onPolicyChange?.(
      name,
      name === 'retryCount' && value.length > 0 ? parseInt(value) : value,
    );
  };

  const handleHeaderChange = (
    {
      target: {name, value},
    }: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    i: number,
  ) => {
    onHeaderChange?.(name, value, i);
  };

  const handleAddHeader = () => {
    onAddHeader?.();
  };

  const handleDeleteHeader = (i: number) => {
    onDeleteHeader?.(i);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave?.();
  };

  const handleDelete = () => {
    onDelete?.();
  };

  const action = item.action;
  const request = action.request;
  let body;
  if (httpMethodsWithBody.includes(request.method)) {
    body = (
      <Row className="mb-3">
        <Form.Group as={Col} controlId="body">
          <Form.Label>Body</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            name="body"
            value={request.body}
            isInvalid={!!errors.body}
            onChange={handleRequestChange}
          />
          <FieldError message={errors.body} />
        </Form.Group>
      </Row>
    );
  }
  return (
    <Form autoComplete="off" role="form" onSubmit={handleSave}>
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
            onChange={handleItemChange}
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
            onChange={handleItemChange}
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
      <Form.Group controlId="state" className="mb-3">
        <Form.Check
          id="stateEnabled"
          name="state"
          inline
          required
          label="Enabled"
          type="radio"
          value="enabled"
          checked={item.state === 'enabled'}
          isInvalid={!!errors.state}
          onChange={handleItemChange}
        />
        <Form.Check
          id="stateDisabled"
          name="state"
          inline
          required
          label="Disabled"
          type="radio"
          value="disabled"
          checked={item.state === 'disabled'}
          isInvalid={!!errors.state}
          onChange={handleItemChange}
        />
        <FieldError message={errors.state} />
      </Form.Group>
      <Row className="mb-3">
        <Form.Group as={Col} controlId="type" className="col-4">
          <Form.Label>Action</Form.Label>
          <Form.Select
            name="type"
            required
            value={action.type}
            isInvalid={!!errors.type}
            onChange={handleActionChange}
          >
            <option>HTTP</option>
          </Form.Select>
          <FieldError message={errors.type} />
        </Form.Group>
        <Form.Group as={Col} controlId="schedule">
          <Form.Label>
            Schedule
            <small className="text-muted ps-2 d-none d-md-inline">
              use either{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://godoc.org/github.com/robfig/cron#hdr-Predefined_schedules"
              >
                pre-defined
              </a>
              ,{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://godoc.org/github.com/robfig/cron#hdr-Intervals"
              >
                interval
              </a>{' '}
              or{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://en.wikipedia.org/wiki/Cron"
              >
                cron
              </a>{' '}
              expression
            </small>
          </Form.Label>
          <Form.Control
            name="schedule"
            required
            placeholder="Schedule"
            type="text"
            value={item.schedule}
            isInvalid={!!errors.schedule}
            onChange={handleItemChange}
          />
          <FieldError message={errors.schedule} />
        </Form.Group>
      </Row>
      <RequestRow
        value={action.request}
        errors={errors}
        onChange={handleRequestChange}
      />
      <Row className="mb-3">
        <Form.Group className="col mb-0">
          <Form.Label>Headers</Form.Label>
          <button
            className="btn"
            type="button"
            disabled={pending}
            onClick={handleAddHeader}
          >
            <i className="fa fa-plus" />
          </button>
        </Form.Group>
      </Row>
      {action.request.headers.map((h, i) => (
        <HeaderRow
          key={i}
          value={h}
          pending={pending}
          onChange={(e) => handleHeaderChange(e, i)}
          onClick={() => handleDeleteHeader(i)}
        />
      ))}
      {body}
      <RetryPolicyRow
        value={action.retryPolicy}
        errors={errors}
        onChange={handlePolicyChange}
      />
      <Tip>
        You can use variables for URI, header value and body, e.g.{' '}
        {'{{.Host}}, {{.Token}}'}, etc.
      </Tip>
      <Button type="submit" disabled={pending}>
        Save
      </Button>
      {item.id && (
        <>
          <Link
            to={`/jobs/${item.id}/history`}
            className="btn btn-outline-secondary ms-2"
          >
            History
          </Link>
          <Button
            onClick={handleDelete}
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

interface RequestRowProps {
  value: HttpRequest;
  errors: Errors;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

export const RequestRow = ({value, errors, onChange}: RequestRowProps) => (
  <Row className="mb-3">
    <Form.Group as={Col} controlId="method" className="col-4">
      <Form.Label>Method</Form.Label>
      <Form.Select
        name="method"
        required
        value={value.method}
        isInvalid={!!errors.method}
        onChange={onChange}
      >
        <option>HEAD</option>
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>PATCH</option>
        <option>DELETE</option>
      </Form.Select>
      <FieldError message={errors.method} />
    </Form.Group>
    <Form.Group as={Col} controlId="uri">
      <Form.Label>URI</Form.Label>
      <Form.Control
        name="uri"
        required
        placeholder="URI"
        type="text"
        value={value.uri}
        isInvalid={!!errors.uri}
        onChange={onChange}
      />
      <FieldError message={errors.uri} />
    </Form.Group>
  </Row>
);

interface HeaderRowProps {
  value: HttpRequestHeader;
  pending: boolean;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onClick?: () => void;
}

export const HeaderRow = ({
  value,
  pending,
  onChange,
  onClick,
}: HeaderRowProps) => (
  <Row className="mb-3">
    <Form.Group as={Col} className="input-group">
      <button
        className="btn"
        type="button"
        disabled={pending}
        onClick={onClick}
      >
        <i className="fa fa-times" />
      </button>
      <Form.Control
        name="name"
        placeholder="Name"
        type="text"
        required
        minLength={5}
        maxLength={32}
        value={value.name}
        onChange={onChange}
      />
    </Form.Group>
    <Form.Group as={Col}>
      <Form.Control
        name="value"
        placeholder="Value"
        type="text"
        required
        maxLength={256}
        value={value.value}
        onChange={onChange}
      />
    </Form.Group>
  </Row>
);

interface RetryPolicyRowProps {
  value: RetryPolicy;
  errors: Errors;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RetryPolicyRow = ({
  value,
  errors,
  onChange,
}: RetryPolicyRowProps) => (
  <Row className="mb-3">
    <Form.Group as={Col} controlId="retryCount">
      <Form.Label>Retry Count</Form.Label>
      <Form.Control
        name="retryCount"
        required
        min={0}
        max={10}
        placeholder="Retry Count"
        type="number"
        value={value.retryCount}
        isInvalid={!!errors.retryCount}
        onChange={onChange}
      />
      <FieldError message={errors.retryCount} />
    </Form.Group>
    <Form.Group as={Col} controlId="retryInterval">
      <Form.Label>Interval</Form.Label>
      <Form.Control
        name="retryInterval"
        required
        placeholder="Interval"
        type="text"
        value={value.retryInterval}
        isInvalid={!!errors.retryInterval}
        onChange={onChange}
      />
      <FieldError message={errors.retryInterval} />
    </Form.Group>
    <Form.Group as={Col} controlId="deadline">
      <Form.Label>Deadline</Form.Label>
      <Form.Control
        name="deadline"
        required
        placeholder="Deadline"
        type="text"
        value={value.deadline}
        isInvalid={!!errors.deadline}
        onChange={onChange}
      />
      <FieldError message={errors.deadline} />
    </Form.Group>
  </Row>
);
