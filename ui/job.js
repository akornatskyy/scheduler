import React from 'react';
import update from 'immutability-helper';
import {Form, Button, Col} from 'react-bootstrap';

import {Layout, FieldError} from './shared';

const httpMethodsWithBody = ['POST', 'PUT', 'PATCH'];

export default class Job extends React.Component {
  state = {
    item: {
      name: '',
      state: '',
      schedule: '',
      collectionId: '',
      action: {
        type: 'HTTP',
        request: {
          method: 'GET',
          uri: '',
          headers: [],
          body: ''
        },
        retryPolicy: {
          retryCount: 3,
          retryInterval: '10s',
          deadline: '1m'
        }
      }
    },
    collections: [],
    pending: true,
    errors: {}
  };

  componentDidMount() {
  }

  handleItemChange = ({target: {name, value}}) => {
    this.setState({
      item: {
        ...this.state.item,
        [name]: value
      }
    });
  };

  handleActionChange = ({target: {name, value}}) => {
    this.setState({
      item: update(this.state.item, {
        action: {
          [name]: {$set: value}
        }
      })
    });
  };

  handleRequestChange = ({target: {name, value}}) => {
    this.setState({
      item: update(this.state.item, {
        action: {
          request: {
            [name]: {$set: value}
          }
        }
      })
    });
  };

  handlePolicyChange = ({target: {name, value}}) => {
    this.setState({
      item: update(this.state.item, {
        action: {
          retryPolicy: {
            [name]: {$set: name === 'retryCount' ? parseInt(value) : value}
          }
        }
      })
    });
  };

  handleSave = (e) => {
  };

  handleDelete = () => {
  };

  render() {
    const {item, collections, pending, errors} = this.state;
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
      <Layout title={`Job ${item.name}`} errors={errors}>
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
              <Form.Label>Schedule</Form.Label>
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
          {body}
          <RetryPolicy
            value={action.retryPolicy}
            errors={errors}
            onChange={this.handlePolicyChange} />
          <Button type="submit" disabled={pending}>
            Save
          </Button>
        </Form>
      </Layout>
    );
  }
}

const Request = ({value, errors, onChange}) => (
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

const RetryPolicy = ({value, errors, onChange}) => (
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
