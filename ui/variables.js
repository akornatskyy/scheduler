import React from 'react';
import {Link} from 'react-router-dom';
import {Table, Button} from 'react-bootstrap';

import api from './api';
import {Layout, groupBy} from './shared';


export default class Variables extends React.Component {
  state = {variables: [], collections: [], errors: {}};

  componentDidMount() {
    const collectionId = new URLSearchParams(this.props.location.search)
        .get('collectionId');
    Promise
        .all([
          api.listCollections()
              .then((data) => this.setState({collections: data.items})),
          api.listVariables(collectionId)
              .then((data) => this.setState({variables: data.items}))
        ])
        .catch((errors) => this.setState({errors: errors}));
  }

  render() {
    const {variables, collections, errors} = this.state;
    const grouped = groupBy(variables, 'collectionId');
    const {url} = this.props.match;
    const rows = [];
    collections.forEach((c) => {
      const variablesByCollection = grouped[c.id];
      if (!variablesByCollection) {
        return;
      }
      rows.push(
          <tr key={c.id}>
            <td colSpan="2">
              <Link to={`/collections/${c.id}`}>{c.name}</Link>
            </td>
          </tr>
      );
      rows.push(variablesByCollection.map((i) => (
        <tr key={i.id}>
          <td>
            <Link to={`${url}/${i.id}`}>{i.name}</Link>
          </td>
          <td>
            {new Date(i.updated).toLocaleString()}
          </td>
        </tr>
      )));
    });
    return (
      <Layout title="Variables" errors={errors}>
        <Table bordered striped hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th className="w-25">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
        <Button as={Link} to={`${url}/add`}>
          Add
        </Button>
      </Layout>
    );
  }
}
