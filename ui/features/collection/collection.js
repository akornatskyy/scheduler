import React from 'react';
import {Link} from 'react-router-dom';
import {Form, Button} from 'react-bootstrap';

import api from '../../api';
import {Layout, FieldError, Tip} from '../../shared/shared';

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

  handleDelete = () => {
    const {id, etag} = this.state.item;
    this.setState({pending: true});
    api.deleteCollection(id, etag)
        .then(() => this.props.history.goBack())
        .catch((errors) => this.setState({errors: errors, pending: false}));
  };

  render() {
    const {item, pending, errors} = this.state;
    return (
      <Layout title={`Collection ${item.name}`} errors={errors}>
        <Form autoComplete="off" onSubmit={this.handleSave}>
          <Form.Group controlId="name">
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
              onChange={this.handleChange} />
            <Form.Check
              id="stateDisabled"
              name="state"
              inline
              label="Disabled"
              type="radio"
              value="disabled"
              checked={item.state === 'disabled'}
              isInvalid={!!errors.state}
              onChange={this.handleChange} />
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
            </>
          )}

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
