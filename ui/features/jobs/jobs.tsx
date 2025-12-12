import React from 'react';
import {Link} from 'react-router-dom';
import {Layout} from '../../shared/components';
import * as api from './jobs-api';
import {JobList} from './jobs-components';
import {Collection, Job} from './types';

type Errors = Record<string, string>;

type Props = {
  location: {
    search?: string;
  };
};

type State = {
  collections: Collection[];
  jobs: Job[];
  errors: Errors;
};

export default class JobsContainer extends React.Component<Props, State> {
  timer: ReturnType<typeof setInterval> | undefined;

  state: State = {collections: [], jobs: [], errors: {}};

  componentDidMount() {
    this.refresh();
    this.timer = setInterval(() => this.refresh(), 10000);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
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
        <Link to="jobs/add" className="btn btn-primary">
          Add
        </Link>
      </Layout>
    );
  }
}
