import React from 'react';
import {Link} from 'react-router-dom';
import {Button} from 'react-bootstrap';

import {Layout} from '../../shared/components';
import * as api from './jobs-api';
import {JobList} from './jobs-components';

export default class Jobs extends React.Component {
  state = {collections: [], jobs: [], errors: {}};

  componentDidMount() {
    this.refresh();
    this.timer = setInterval(() => this.refresh(), 10000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  refresh() {
    const collectionId = new URLSearchParams(this.props.location.search).get(
      'collectionId',
    );
    api
      .listCollections()
      .then(({items}) => this.setState({collections: items}))
      .catch((errors) => this.setState({errors}));
    api
      .listJobs(collectionId)
      .then(({items}) => this.setState({jobs: items}))
      .catch((errors) => this.setState({errors}));
  }

  render() {
    const {collections, jobs, errors} = this.state;
    return (
      <Layout title="Jobs" errors={errors}>
        <JobList collections={collections} jobs={jobs} />
        <Button as={Link} to="jobs/add">
          Add
        </Button>
      </Layout>
    );
  }
}
