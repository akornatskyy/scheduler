import React from 'react';
import {Form, Button, Col} from 'react-bootstrap';

import api from './api';
import {Layout, FieldError, Tip} from './shared';

export default class Variable extends React.Component {
  state = {
    item: {
      name: '',
      value: ''
    },
    collections: [],
    pending: true,
    errors: {}
  };

  componentDidMount() {
    const {id} = this.props.match.params;
    if (id) {
      api.retrieveVariable(id)
          .then((data) => this.setState({item: data, pending: false}))
          .catch((errors) => this.setState({errors: errors, pending: false}));
    } else {
      this.setState({item: {name: '', value: ''}, pending: false});
    }
    api.listCollections()
        .then((data) => {
          const s = {collections: data.items};
          if (!this.state.item.collectionId) {
            if (data.items.length > 0) {
              s.item = {
                ...this.state.item,
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

  handleChange = ({target: {name, value}}) => {
    this.setState({
      item: {...this.state.item,
        [name]: value
      }
    });
  };

  handleSave = (e) => {
    e.preventDefault();
    this.setState({pending: true});
    api.saveVariable(this.state.item)
        .then(() => this.props.history.goBack())
        .catch((errors) => this.setState({errors: errors, pending: false}));
  };

  handleDelete = () => {
    const {id, etag} = this.state.item;
    this.setState({pending: true});
    api.deleteVariable(id, etag)
        .then(() => this.props.history.goBack())
        .catch((errors) => this.setState({errors: errors, pending: false}));
  };

  render() {
    const {item, collections, pending, errors} = this.state;
    return (
      <Layout title={`Variable ${item.name}`} errors={errors}>
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
                onChange={this.handleChange} />
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
                onChange={this.handleChange}>
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
                onChange={this.handleChange} />
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
