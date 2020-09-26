import React from 'react';

import {Layout} from '../../shared/components';
import * as api from './variable-api';
import {VariableForm} from './variable-components';

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
          .catch((errors) => this.setState({errors, pending: false}));
    } else {
      this.setState({item: {name: '', value: ''}, pending: false});
    }
    api.listCollections()
        .then(({items}) => {
          const s = {collections: items};
          if (!this.state.item.collectionId) {
            if (items.length > 0) {
              s.item = {
                ...this.state.item,
                collectionId: items[0].id
              };
            } else {
              s.errors = {
                collectionId: 'There is no collection available.'
              };
            }
          }

          this.setState(s);
        })
        .catch((errors) => this.setState({errors}));
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
    api.saveVariable(this.state.item)
        .then(() => this.props.history.goBack())
        .catch((errors) => this.setState({errors, pending: false}));
  };

  handleDelete = () => {
    const {id, etag} = this.state.item;
    this.setState({pending: true});
    api.deleteVariable(id, etag)
        .then(() => this.props.history.goBack())
        .catch((errors) => this.setState({errors, pending: false}));
  };

  render() {
    const {item, collections, pending, errors} = this.state;
    return (
      <Layout title={`Variable ${item.name}`} errors={errors}>
        <VariableForm
          item={item}
          collections={collections}
          pending={pending}
          errors={errors}
          onChange={this.handleChange}
          onSave={this.handleSave}
          onDelete={this.handleDelete}
        />
      </Layout>
    );
  }
}
