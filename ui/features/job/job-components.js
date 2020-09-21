import React from 'react';
import {Link} from 'react-router-dom';
import {Form, Button, Col} from 'react-bootstrap';

import {FieldError, Tip} from '../../shared/shared';

const httpMethodsWithBody = ['POST', 'PUT', 'PATCH'];

export class JobForm extends React.Component {
  handleItemChange = ({target: {name, value}}) => {
    this.props.onItemChange?.(name, value);
  };

  handleActionChange = ({target: {name, value}}) => {
    this.props.onActionChange?.(name, value);
  };

  handleRequestChange = ({target: {name, value}}) => {
    this.props.onRequestChange?.(name, value);
  };

  handlePolicyChange = ({target: {name, value}}) => {
    this.props.onPolicyChange?.(
      name,
      name === 'retryCount' ? parseInt(value) : value);
  };

  handleHeaderChange = ({target: {name, value}}, i) => {
    this.props.onHeaderChange?.(name, value, i);
  }

  handleAddHeader = () => {
    this.props.onAddHeader?.();
  }

  handleDeleteHeader = (i) => {
    this.props.onDeleteHeader?.(i);
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.onSave?.();
  };

  handleDelete = () => {
    this.props.onDelete?.();
  };

  render() {
    const {item, collections, pending, errors} = this.props;
    const action = item.action;
    const request = action.request;
    let body;
    if (httpMethodsWithBody.includes(request.method)) {
      body = (
        <Form.Row>
          <Form.Group as={Col} controlId="body">
            <Form.Label>Body</Form.Label>
            <Form.Control
              as="textarea"
              rows="5"
              name="body"
              value={request.body}
              isInvalid={!!errors.body}
              onChange={this.handleRequestChange} />
            <FieldError message={errors.body} />
          </Form.Group>
        </Form.Row>
      );
    }
    return (
      <Form autoComplete="off" onSubmit={this.handleSave}>
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
              onChange={this.handleItemChange} />
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
              onChange={this.handleItemChange}>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Control>
            <FieldError message={errors.collectionId} />
          </Form.Group>
        </Form.Row>
        <Form.Group controlId="state">
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
            onChange={this.handleItemChange} />
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
            onChange={this.handleItemChange} />
          <FieldError message={errors.state} />
        </Form.Group>
        <Form.Row>
          <Form.Group as={Col} controlId="type" className="col-4">
            <Form.Label>Action</Form.Label>
            <Form.Control
              name="type"
              required
              as="select"
              value={action.type}
              isInvalid={!!errors.type}
              onChange={this.handleActionChange}>
              <option>HTTP</option>
            </Form.Control>
            <FieldError message={errors.type} />
          </Form.Group>
          <Form.Group as={Col} controlId="schedule">
            <Form.Label>
              Schedule
              <small className="text-muted pl-2 d-none d-md-inline">
                use either <a target="_blank" rel="noopener noreferrer"
                  href="https://godoc.org/github.com/robfig/cron#hdr-Predefined_schedules">
                  pre-defined
                </a>, <a target="_blank" rel="noopener noreferrer"
                  href="https://godoc.org/github.com/robfig/cron#hdr-Intervals">
                  interval
                </a> or <a target="_blank" rel="noopener noreferrer"
                  href="https://en.wikipedia.org/wiki/Cron">
                  cron
                </a> expression
              </small>
            </Form.Label>
            <Form.Control
              name="schedule"
              required
              placeholder="Schedule"
              type="text"
              value={item.schedule}
              isInvalid={!!errors.schedule}
              onChange={this.handleItemChange} />
            <FieldError message={errors.schedule} />
          </Form.Group>
        </Form.Row>
        <Request
          value={action.request}
          errors={errors}
          onChange={this.handleRequestChange} />
        <Form.Row>
          <Form.Group className="col mb-0" >
            <Form.Label>Headers</Form.Label>
            <button className="btn" type="button" disabled={pending}
              onClick={this.handleAddHeader}>
              <i className="fa fa-plus" />
            </button>
          </Form.Group>
        </Form.Row>
        {action.request.headers.map((h, i) => (
          <Header
            key={i}
            value={h}
            pending={pending}
            onChange={(e) => this.handleHeaderChange(e, i)}
            onClick={() => this.handleDeleteHeader(i)} />
        ))}
        {body}
        <RetryPolicy
          value={action.retryPolicy}
          errors={errors}
          onChange={this.handlePolicyChange} />
        <Tip>
          You can use variables for URI, header value
          and body, e.g. {'{{.Host}}, {{.Token}}'}, etc.
        </Tip>
        <Button type="submit" disabled={pending}>
          Save
        </Button>
        {item.id && (
          <>
            <Button
              as={Link}
              to={`/jobs/${item.id}/history`}
              variant="outline-secondary"
              disabled={pending}
              className="ml-2">
              History
            </Button>
            <Button
              onClick={this.handleDelete}
              variant="danger"
              className="float-right"
              disabled={pending}>
              Delete
            </Button>
          </>
        )}
      </Form>
    );
  }
}

export const Request = ({value, errors, onChange}) => (
  <Form.Row>
    <Form.Group as={Col} controlId="method" className="col-4">
      <Form.Label>Method</Form.Label>
      <Form.Control
        name="method"
        required
        as="select"
        value={value.method}
        isInvalid={!!errors.method}
        onChange={onChange}>
        <option>HEAD</option>
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>PATCH</option>
        <option>DELETE</option>
      </Form.Control>
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
        onChange={onChange} />
      <FieldError message={errors.uri} />
    </Form.Group>
  </Form.Row>
);

export const Header = ({value, pending, onChange, onClick}) => (
  <Form.Row>
    <button className="btn mb-3 mr-n2" type="button" disabled={pending}
      onClick={onClick}>
      <i className="fa fa-times" />
    </button>
    <Form.Group as={Col}>
      <Form.Control
        name="name"
        placeholder="Name"
        type="text"
        required
        minLength="5"
        maxLength="32"
        value={value.name}
        onChange={onChange} />
    </Form.Group>
    <Form.Group as={Col}>
      <Form.Control
        name="value"
        placeholder="Value"
        type="text"
        required
        maxLength="256"
        value={value.value}
        onChange={onChange} />
    </Form.Group>
  </Form.Row>
);

export const RetryPolicy = ({value, errors, onChange}) => (
  <Form.Row>
    <Form.Group as={Col} controlId="retryCount">
      <Form.Label>Retry Count</Form.Label>
      <Form.Control
        name="retryCount"
        required
        min="0"
        max="10"
        placeholder="Retry Count"
        type="number"
        value={value.retryCount}
        isInvalid={!!errors.retryCount}
        onChange={onChange} />
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
        onChange={onChange} />
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
        onChange={onChange} />
      <FieldError message={errors.deadline} />
    </Form.Group>
  </Form.Row>
);
