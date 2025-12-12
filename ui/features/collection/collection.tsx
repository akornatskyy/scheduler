import React from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {Layout} from '../../shared/components';
import * as api from './collection-api';
import {CollectionForm} from './collection-components';
import {Collection} from './types';

type Errors = Record<string, string>;

type Props = RouteComponentProps<{id?: string}>;

type State = {
  item: Collection;
  pending: boolean;
  errors: Errors;
};

export default class CollectionContainer extends React.Component<Props, State> {
  state: State = {
    item: {
      name: '',
      state: 'enabled',
    },
    pending: true,
    errors: {},
  };

  componentDidMount() {
    const {id} = this.props.match.params;
    if (id) {
      api
        .retrieveCollection(id)
        .then((data) => this.setState({item: data, pending: false}))
        .catch((errors) => this.setState({errors, pending: false}));
    } else {
      this.setState({item: {name: '', state: 'enabled'}, pending: false});
    }
  }

  handleChange = (name: string, value: string) => {
    this.setState({
      item: {...this.state.item, [name]: value},
    });
  };

  handleSave = () => {
    this.setState({pending: true});
    api
      .saveCollection(this.state.item)
      .then(() => this.props.history.goBack())
      .catch((errors) => this.setState({errors, pending: false}));
  };

  handleDelete = () => {
    const {id, etag} = this.state.item;
    if (!id) return;
    this.setState({pending: true});
    api
      .deleteCollection(id, etag)
      .then(() => this.props.history.goBack())
      .catch((errors) => this.setState({errors, pending: false}));
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
          onDelete={this.handleDelete}
        />
      </Layout>
    );
  }
}
