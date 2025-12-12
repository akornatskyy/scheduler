import React from 'react';
import {Link} from 'react-router-dom';
import {Layout} from '../../shared/components';
import {Collection, Variable} from './types';
import * as api from './variables-api';
import {VariableList} from './variables-components';

type Errors = Record<string, string>;

type Props = {
  location: {
    search?: string;
  };
};

type State = {
  collections: Collection[];
  variables: Variable[];
  errors: Errors;
};

export default class VariablesContainer extends React.Component<Props, State> {
  state: State = {collections: [], variables: [], errors: {}};

  componentDidMount() {
    const collectionId = new URLSearchParams(this.props.location.search).get(
      'collectionId',
    );
    api
      .listCollections()
      .then(({items}) => this.setState({collections: items}))
      .catch((errors) => this.setState({errors}));
    api
      .listVariables(collectionId)
      .then(({items}) => this.setState({variables: items}))
      .catch((errors) => this.setState({errors}));
  }

  render() {
    const {variables, collections, errors} = this.state;
    return (
      <Layout title="Variables" errors={errors}>
        <VariableList collections={collections} variables={variables} />
        <Link to="variables/add" className="btn btn-primary">
          Add
        </Link>
      </Layout>
    );
  }
}
