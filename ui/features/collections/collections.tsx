import React from 'react';
import {Link} from 'react-router-dom';
import {Layout} from '../../shared/components';
import * as api from './collections-api';
import {CollectionList} from './collections-components';
import {Collection} from './types';

type Errors = Record<string, string>;

type State = {
  items: Collection[];
  errors: Errors;
};

export default class CollectionsContainer extends React.Component<
  Record<string, never>,
  State
> {
  state: State = {items: [], errors: {}};

  componentDidMount() {
    api
      .listCollections()
      .then(({items}) => this.setState({items}))
      .catch((errors) => this.setState({errors}));
  }

  render() {
    const {items, errors} = this.state;
    return (
      <Layout title="Collections" errors={errors}>
        <CollectionList items={items} />
        <Link to="collections/add" className="btn btn-primary">
          Add
        </Link>
      </Layout>
    );
  }
}
