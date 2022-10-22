import React from 'react';
import {Link} from 'react-router-dom';
import {Button} from 'react-bootstrap';

import {Layout} from '../../shared/components';
import * as api from './collections-api';
import {CollectionList} from './collections-components';

export default class Collections extends React.Component {
  state = {items: [], errors: {}};

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
        <Button as={Link} to="collections/add">
          Add
        </Button>
      </Layout>
    );
  }
}
