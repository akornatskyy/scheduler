import React from 'react';

import {Layout} from '../../shared/shared';
import * as api from './collection-api';
import {CollectionForm} from './collection-components';

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

  handleChange = (name, value) => {
    this.setState({
      item: {...this.state.item,
        [name]: value
      }
    });
  };

  handleSave = () => {
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
        <CollectionForm
          item={item}
          pending={pending}
          errors={errors}
          onChange={this.handleChange}
          onSave={this.handleSave}
          onDelete={this.handleDelete} />
      </Layout>
    );
  }
}
