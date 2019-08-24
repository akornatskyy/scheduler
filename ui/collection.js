import React from 'react';
import {Form, Button} from 'react-bootstrap';

import api from './api';
import Errors from './errors';
import Layout from './layout';

export default class Collection extends React.Component {
  state = {
    item: {
      name: '',
      state: ''
    },
    pending: true,
    errors: {}
  };

  componentDidMount() {
    const {id} = this.props.match.params;
    if (id) {
      api.retrieveCollection(id)
          .then((data) => this.setState({item: data, pending: false}))
          .catch((errors) => this.setState({errors: errors, pending: false}));
    } else {
      this.setState({item: {name: '', state: 'enabled'}, pending: false});
    }
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
    api.saveCollection(this.state.item)
        .then(() => this.props.history.goBack())
        .catch((errors) => this.setState({errors: errors, pending: false}));
  };

  render() {
    const {item, pending, errors} = this.state;
    return (
      <Layout title={`Collection ${item.name}`}>
        <Errors.Summary errors={errors} />
        <Form autoComplete="off" onSubmit={this.handleSave}>
          <Form.Group controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              required
              placeholder="Name"
              type="text"
              value={item.name}
              isInvalid={errors.name}
              onChange={this.handleChange} />
            <Errors.Field message={errors.name} />
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
              onChange={this.handleChange} />
            <Form.Check
              id="stateDisabled"
              name="state"
              inline
              label="Disabled"
              type="radio"
              value="disabled"
              checked={item.state === 'disabled'}
              onChange={this.handleChange} />
          </Form.Group>
          <Button type="submit" disabled={pending}>
            Save
          </Button>
        </Form>
      </Layout>
    );
  }
}
