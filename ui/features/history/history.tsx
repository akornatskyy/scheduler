import React from 'react';
import type {RouteComponentProps} from 'react-router-dom';
import {Layout} from '../../shared/components';
import * as api from './history-api';
import {JobHistoryList} from './history-components';
import {Job, JobHistory, JobStatus} from './types';

type Errors = Record<string, string>;

type Props = RouteComponentProps<{id: string}>;

type State = {
  job: Job;
  status: JobStatus;
  items: JobHistory[];
  errors: Errors;
};

export default class JobHistoryContainer extends React.Component<Props, State> {
  state: State = {
    job: {
      name: '',
    },
    status: {
      etag: '',
      running: false,
      runCount: 0,
      errorCount: 0,
      lastRun: '',
      nextRun: '',
    },
    items: [],
    errors: {},
  };

  componentDidMount() {
    const {id} = this.props.match.params;
    api
      .retrieveJob(id)
      .then((job) => this.setState({job}))
      .catch((errors) => this.setState({errors}));
    api
      .retrieveJobStatus(id)
      .then((status) => this.setState({status}))
      .catch((errors) => this.setState({errors}));
    api
      .listJobHistory(id)
      .then(({items}) => this.setState({items: items.slice(0, 7)}))
      .catch((errors) => this.setState({errors}));
  }

  handleBack = () => {
    this.props.history.goBack();
  };

  handleRun = () => {
    const {id} = this.props.match.params;
    const {etag} = this.state.status;
    api
      .patchJobStatus(id, {running: true, etag})
      .then(() =>
        api
          .retrieveJobStatus(id)
          .then((status) => this.setState({status}))
          .catch((errors) => this.setState({errors})),
      )
      .catch((errors) => this.setState({errors}));
  };

  handleDelete = () => {
    const {id} = this.props.match.params;
    const {etag} = this.state.status;
    api
      .deleteJobHistory(id, etag)
      .then(() => this.props.history.goBack())
      .catch((errors) => this.setState({errors}));
  };

  render() {
    const {job, status, items, errors} = this.state;
    return (
      <Layout title={`Job History ${job.name}`} errors={errors}>
        <JobHistoryList
          status={status}
          items={items}
          onBack={this.handleBack}
          onRun={this.handleRun}
          onDelete={this.handleDelete}
        />
      </Layout>
    );
  }
}
