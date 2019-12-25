import React from 'react';
import {Table, Button, Row, Col} from 'react-bootstrap';

import api from './api';
import {Layout} from './shared';

export default class JobHistory extends React.Component {
  state = {
    job: {
      name: ''
    },
    status: {
      running: null,
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
        .catch((errors) => this.setState({errors: errors}));
    api.retrieveJobStatus(id)
        .then((data) => this.setState({status: data}))
        .catch((errors) => this.setState({errors: errors}));
    api.listJobHistory(id)
        .then((data) => this.setState({items: data.items.slice(0, 7)}))
        .catch((errors) => this.setState({errors: errors}));
  }

  handleBack = () => {
    this.props.history.goBack();
  }

  handleRun = () => {
    const {id} = this.props.match.params;
    api.patchJobStatus(id, {running: true})
        .then(() => {
          api.retrieveJobStatus(id)
              .then((data) => this.setState({status: data}))
              .catch((errors) => this.setState({errors: errors}));
        })
        .catch((errors) => this.setState({errors: errors}));
  }

  handleDelete = () => {
    const {id} = this.props.match.params;
    api.deleteJobHistory(id)
        .then(() => this.props.history.goBack())
        .catch((errors) => this.setState({errors: errors}));
  };

  render() {
    const {job, status, items, errors} = this.state;
    return (
      <Layout title={`Job History ${job.name}`} errors={errors}>
        <Row>
          <Col><label>Status</label></Col>
          <Col>{formatRunning(status.running)}</Col>
          <Col><label>Run / Error Count</label></Col>
          <Col>{status.runCount} / {status.errorCount}</Col>
        </Row>
        <Row>
          <Col><label>Last Run</label></Col>
          <Col>{formatDate(status.lastRun)}</Col>
          <Col><label>Next Run</label></Col>
          <Col>{formatDate(status.nextRun)}</Col>
        </Row>
        <Table bordered striped hover>
          <thead>
            <tr>
              <th>Action</th>
              <th>Started</th>
              <th>Finished</th>
              <th>Status</th>
              <th>Retries</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, index) => (
              <tr key={index}>
                <td>{i.action}</td>
                <td>{formatDate(i.started)}</td>
                <td>{formatDate(i.finished)}</td>
                <td>{i.status}</td>
                <td>{i.retryCount}</td>
                <td>{i.message}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button onClick={this.handleBack}>
          Back
        </Button>
        <Button
          onClick={this.handleRun}
          variant="outline-secondary"
          disabled={status.running === true}
          className="ml-2">
          Run
        </Button>
        {items.length > 0 && (
          <Button
            onClick={this.handleDelete}
            variant="danger"
            className="float-right">
            Delete
          </Button>
        )}
      </Layout>
    );
  }
}

export const formatRunning = (r) =>
  r == null ? '' : r ? 'Running' : 'Scheduled';

export const formatDate = (s) => {
  if (!s) {
    return 'N/A';
  }

  return new Date(s).toLocaleString();
};
