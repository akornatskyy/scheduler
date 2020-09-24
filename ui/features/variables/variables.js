import React from 'react';
import {Link} from 'react-router-dom';
import {Button} from 'react-bootstrap';

import {Layout} from '../../shared/shared';
import * as api from './variables-api';
import {VariableList} from './variables-components';


export default class Variables extends React.Component {
  state = {collections: [], variables: [], errors: {}};

  componentDidMount() {
    const collectionId = new URLSearchParams(this.props.location.search)
        .get('collectionId');
    api.listCollections()
        .then(({items}) => this.setState({collections: items}))
        .catch((errors) => this.setState({errors}));
    api.listVariables(collectionId)
        .then(({items}) => this.setState({variables: items}))
        .catch((errors) => this.setState({errors}));
  }

  render() {
    const {variables, collections, errors} = this.state;
    return (
      <Layout title="Variables" errors={errors}>
        <VariableList collections={collections} variables={variables} />
        <Button as={Link} to='variables/add'>
          Add
        </Button>
      </Layout>
    );
  }
}
