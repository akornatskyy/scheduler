import React from 'react';

import {Layout} from '../../shared/components';
import * as api from './history-api';
import {JobHistoryList} from './history-components';

export default class JobHistory extends React.Component {
  state = {
    job: {
      name: ''
    },
    status: {
      running: '',
      runCount: '',
      errorCount: '',
      lastRun: '',
      nextRun: ''
    },
    items: [],
    errors: {}
  };

  componentDidMount() {
    const {id} = this.props.match.params;
    api.retrieveJob(id)
        .then((data) => this.setState({job: data}))
        .catch((errors) => this.setState({errors}));
    api.retrieveJobStatus(id)
        .then((data) => this.setState({status: data}))
        .catch((errors) => this.setState({errors}));
    api.listJobHistory(id)
        .then(({items}) => this.setState({items: items.slice(0, 7)}))
        .catch((errors) => this.setState({errors}));
  }

  handleBack = () => {
    this.props.history.goBack();
  };

  handleRun = () => {
    const {id} = this.props.match.params;
    const {etag} = this.state.status;
    api.patchJobStatus(id, {running: true, etag})
        .then(() =>
          api.retrieveJobStatus(id)
              .then((data) => this.setState({status: data}))
              .catch((errors) => this.setState({errors}))
        )
        .catch((errors) => this.setState({errors}));
  };

  handleDelete = () => {
    const {id} = this.props.match.params;
    const {etag} = this.state.status;
    api.deleteJobHistory(id, etag)
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
          onDelete={this.handleDelete} />
      </Layout>
    );
  }
}
