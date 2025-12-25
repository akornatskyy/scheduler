import {FieldError, Mutate, Tip} from '$shared/components';
import {Errors} from '$shared/errors';
import React, {ChangeEvent} from 'react';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {Link} from 'react-router';
import {
  CollectionItem,
  HttpRequest,
  HttpRequestHeader,
  JobInput,
  RetryPolicy,
} from '../types';

type Props = {
  item: JobInput;
  collections: CollectionItem[];
  pending: boolean;
  errors: Errors;
  mutate: Mutate<JobInput>;
  onSave: () => void;
  onDelete: () => void;
};

const httpMethodsWithBody = ['POST', 'PUT', 'PATCH'];

export const JobForm = ({
  item,
  collections,
  pending,
  errors,
  mutate,
  onSave,
  onDelete,
}: Props) => {
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave();
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
            name="body"
            as="textarea"
            rows={5}
            value={request.body}
            isInvalid={!!errors.body}
            onChange={(e) =>
              mutate((d) => (d.action.request.body = e.target.value))
            }
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
          onChange={() => mutate((d) => (d.state = 'enabled'))}
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
          onChange={() => mutate((d) => (d.state = 'disabled'))}
        />
        <FieldError message={errors.state} />
      </Form.Group>
      <Row className="mb-3">
        <Form.Group as={Col} controlId="type" className="col-4">
          <Form.Label>Action</Form.Label>
          <Form.Select name="type" required isInvalid={!!errors.type}>
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
            onChange={(e) => mutate((d) => (d.schedule = e.target.value))}
          />
          <FieldError message={errors.schedule} />
        </Form.Group>
      </Row>
      <RequestRow value={action.request} errors={errors} mutate={mutate} />
      <Row className="mb-3">
        <Form.Group className="col mb-0">
          <Form.Label>Headers</Form.Label>
          <button
            title="Add Header"
            className="btn"
            type="button"
            disabled={pending}
            onClick={() =>
              mutate((d) =>
                d.action.request.headers.push({name: '', value: ''}),
              )
            }
          >
            <i className="fa fa-plus" />
          </button>
        </Form.Group>
      </Row>
      <HeadersRow
        headers={action.request.headers}
        pending={pending}
        mutate={mutate}
      />
      {body}
      <RetryPolicyRow
        value={action.retryPolicy}
        errors={errors}
        mutate={mutate}
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

interface RequestRowProps {
  value: HttpRequest;
  errors: Errors;
  mutate: Mutate<JobInput>;
}

export const RequestRow = ({value, errors, mutate}: RequestRowProps) => (
  <Row className="mb-3">
    <Form.Group as={Col} controlId="method" className="col-4">
      <Form.Label>Method</Form.Label>
      <Form.Select
        name="method"
        required
        value={value.method}
        isInvalid={!!errors.method}
        onChange={(e) =>
          mutate((d) => (d.action.request.method = e.target.value))
        }
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
        onChange={(e) => mutate((d) => (d.action.request.uri = e.target.value))}
      />
      <FieldError message={errors.uri} />
    </Form.Group>
  </Row>
);

interface HeadersRowProps {
  headers: HttpRequestHeader[];
  pending: boolean;
  mutate: Mutate<JobInput>;
}

export const HeadersRow = ({headers, pending, mutate}: HeadersRowProps) =>
  headers.map((header, i) => (
    <Row key={i} className="mb-3">
      <Form.Group as={Col} className="input-group">
        <button
          title="Remove Header"
          className="btn"
          type="button"
          disabled={pending}
          onClick={() => mutate((d) => d.action.request.headers.splice(i, 1))}
        >
          <i className="fa fa-times" />
        </button>
        <Form.Control
          aria-label="Header Name"
          placeholder="Name"
          type="text"
          required
          minLength={5}
          maxLength={32}
          value={header.name}
          onChange={(e) =>
            mutate((d) => (d.action.request.headers[i].name = e.target.value))
          }
        />
      </Form.Group>
      <Form.Group as={Col}>
        <Form.Control
          aria-label="Header Value"
          placeholder="Value"
          type="text"
          required
          maxLength={256}
          value={header.value}
          onChange={(e) =>
            mutate((d) => (d.action.request.headers[i].value = e.target.value))
          }
        />
      </Form.Group>
    </Row>
  ));

interface RetryPolicyRowProps {
  value: RetryPolicy;
  errors: Errors;
  mutate: Mutate<JobInput>;
}

export const RetryPolicyRow = ({
  value,
  errors,
  mutate,
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
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          mutate(
            (d) => (d.action.retryPolicy.retryCount = e.target.valueAsNumber),
          )
        }
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
        onChange={(e) =>
          mutate((d) => (d.action.retryPolicy.retryInterval = e.target.value))
        }
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
        onChange={(e) =>
          mutate((d) => (d.action.retryPolicy.deadline = e.target.value))
        }
      />
      <FieldError message={errors.deadline} />
    </Form.Group>
  </Row>
);
