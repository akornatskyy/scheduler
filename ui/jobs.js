import React from 'react';
import {Link} from 'react-router-dom';
import {Table, Button} from 'react-bootstrap';

import api from './api';
import {Layout, groupBy} from './shared';

export default class Jobs extends React.Component {
  state = {jobs: [], collections: [], errors: {}};

  componentDidMount() {
    const collectionId = new URLSearchParams(this.props.location.search)
        .get('collectionId');
    api.listCollections()
        .then((data) => this.setState({collections: data.items}))
        .catch((errors) => this.setState({errors: errors}));
    api.listJobs(collectionId)
        .then((data) => this.setState({jobs: data.items, errors: {}}))
        .catch((errors) => this.setState({errors: errors}));
  }

  render() {
    const {jobs, collections, errors} = this.state;
    const {url} = this.props.match;
    const grouped = groupBy(jobs, 'collectionId');
    const rows = [];
    collections.forEach((c) => {
      const jobsByCollection = grouped[c.id];
      if (!jobsByCollection) {
        return;
      }
      rows.push(
          <tr key={c.id} title={c.state}>
            <td colSpan="3">
              <Link to={`/collections/${c.id}`}
                className={c.state === 'disabled'?'text-muted':''}>
                {c.name}
              </Link>
              <Link to={`variables?collectionId=${c.id}`}
                className="badge badge-light mx-1">
                variables
              </Link>
            </td>
          </tr>
      );
      rows.push(jobsByCollection.map((i) => (
        <tr key={i.id}>
          <td>
            <Link to={`${url}/${i.id}`}
              className={i.state === 'disabled'?'text-muted':''}>
              {i.name}
            </Link>
          </td>
          <td className={i.state === 'disabled'?'text-muted':''}>
            {i.schedule}
          </td>
          <td>{i.state}</td>
        </tr>
      )));
    });
    return (
      <Layout title="Jobs" errors={errors}>
        <Table bordered striped hover>
          <thead>
            <tr>
              <th>Name</th>
              <th className="w-25">Schedule</th>
              <th className="w-25">State</th>
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
