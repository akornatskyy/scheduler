import React from 'react';
import update from 'immutability-helper';
import {Link} from 'react-router-dom';
import {Form, Button, Col} from 'react-bootstrap';

import api from './api';
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
    api.listCollections()
        .then((data) => {
          const s = {collections: data.items};
          if (!this.state.item.collectionId) {
            if (data.items.length > 0) {
              s.item = {...this.state.item,
                collectionId: data.items[0].id
              };
            } else {
              s.errors = {
                collectionId: 'There is no collection available.'
              };
            }
          }

          this.setState(s);
        })
        .catch((errors) => this.setState({errors: errors}));
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

  handleHeaderChange = ({target: {name, value}}, i) => {
    this.setState({
      item: update(this.state.item, {
        action: {
          request: {
            headers: {
              [i]: {[name]: {$set: value}}
            }
          }
        }
      })
    });
  }

  handleAddHeader = () => {
    this.setState({
      item: update(this.state.item, {
        action: {
          request: {
            headers: {
              $push: [{name: '', value: ''}]
            }
          }
        }
      })
    });
  }

  handleDeleteHeader = (i) => {
    this.setState({
      item: update(this.state.item, {
        action: {
          request: {
            headers: {
              $splice: [[i, 1]]
            }
          }
        }
      })
    });
  }

  handleSave = (e) => {
  };

  handleDelete = () => {
  };

  render() {
    const {item, collections, pending, errors} = this.state;
    const {url} = this.props.match;
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
          <Button type="submit" disabled={pending}>
            Save
          </Button>
          <Button
            as={Link}
            to={`${url}/history`}
            variant="outline-secondary"
            disabled={pending}
            className="ml-2">
            History
          </Button>
          {item.id && (
            <Button
              onClick={this.handleDelete}
              variant="danger"
              className="float-right"
              disabled={pending}>
              Delete
            </Button>
          )}
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

const Header = ({value, pending, onChange, onClick}) => (
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
