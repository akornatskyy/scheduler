import React from 'react';
import type {RouteComponentProps} from 'react-router-dom';
import {Layout} from '../../shared/components';
import {Collection, Variable} from './types';
import * as api from './variable-api';
import {VariableForm} from './variable-components';

type Errors = Record<string, string>;

type Props = RouteComponentProps<{id?: string}>;

type State = {
  item: Variable;
  collections: Collection[];
  pending: boolean;
  errors: Errors;
};

export default class VariableContainer extends React.Component<Props, State> {
  state: State = {
    item: {
      collectionId: '',
      name: '',
      value: '',
    },
    collections: [],
    pending: true,
    errors: {},
  };

  componentDidMount() {
    const {id} = this.props.match.params;
    if (id) {
      api
        .retrieveVariable(id)
        .then((item) => this.setState({item, pending: false}))
        .catch((errors) => this.setState({errors, pending: false}));
    } else {
      this.setState({pending: false});
    }

    api
      .listCollections()
      .then(({items}) =>
        this.setState(({item}) => {
          const s: Pick<State, 'collections' | 'item' | 'errors'> = {
            collections: items,
            item,
            errors: this.state.errors,
          };
          if (!item.collectionId) {
            if (items.length > 0) {
              s.item = {
                ...item,
                collectionId: items[0].id,
              };
            } else {
              s.errors = {
                collectionId: 'There is no collection available.',
              };
            }
          }

          return s;
        }),
      )
      .catch((errors) => this.setState({errors}));
  }

  handleChange = (name: string, value: string) => {
    this.setState({
      item: {...this.state.item, [name]: value},
    });
  };

  handleSave = () => {
    this.setState({pending: true});
    api
      .saveVariable(this.state.item)
      .then(() => this.props.history.goBack())
      .catch((errors) => this.setState({errors, pending: false}));
  };

  handleDelete = () => {
    const {id, etag} = this.state.item;
    if (!id) return;
    this.setState({pending: true});
    api
      .deleteVariable(id, etag)
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
