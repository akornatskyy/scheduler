import React from 'react';
import {Link} from 'react-router-dom';
import {Table, Button} from 'react-bootstrap';

import api from './api';
import Errors from './errors';
import Layout from './layout';

export default class Collections extends React.Component {
  state = {items: [], errors: {}};

  componentDidMount() {
    api.listCollections()
        .then((data) => this.setState({items: data.items}))
        .catch((errors) => this.setState({errors: errors}));
  }

  render() {
    const {items, errors} = this.state;
    const {url} = this.props.match;
    return (
      <Layout title="Collections">
        <Errors.Summary errors={errors} />
        <Table bordered striped hover>
          <thead>
            <tr>
              <th>Name</th>
              <th className="w-25">State</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>
                  <Link to={`${url}/${i.id}`}>{i.name}</Link>
                </td>
                <td>{i.state}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button as={Link} to={`${url}/add`}>
          Add
        </Button>
      </Layout>
    );
  }
}
