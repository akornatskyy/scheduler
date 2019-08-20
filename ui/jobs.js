import React from 'react';
import {Link} from 'react-router-dom';
import {Table, Button} from 'react-bootstrap';

import api from './api';
import Errors from './errors';
import Layout from './layout';

export default class Jobs extends React.Component {
  state = {items: [], errors: {}};

  componentDidMount() {
    api.listJobs()
        .then((data) => this.setState({items: data.items}))
        .catch((errors) => this.setState({errors: errors}));
  }

  render() {
    const {items, errors} = this.state;
    const {url} = this.props.match;
    return (
      <Layout title="Jobs">
        <Errors.Summary errors={errors} />
        <Table bordered striped hover>
          <thead>
            <tr>
              <th>Name</th>
              <th className="w-25">Schedule</th>
              <th className="w-25">State</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>
                  <Link to={`${url}/${i.id}`}>{i.name}</Link>
                </td>
                <td>{i.schedule}</td>
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
