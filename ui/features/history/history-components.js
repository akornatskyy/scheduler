import React from 'react';
import {Table, Button, Row, Col} from 'react-bootstrap';

export const JobHistoryList = ({status, items, onBack, onRun, onDelete}) => (
  <>
    <Row className="mb-3">
      <Col>
        <label>Status</label>
      </Col>
      <Col>{formatRunning(status.running)}</Col>
      <Col>
        <label>Run / Error Count</label>
      </Col>
      <Col>
        {status.runCount} / {status.errorCount}
      </Col>
    </Row>
    <Row className="mb-3">
      <Col>
        <label>Last Run</label>
      </Col>
      <Col>{formatDate(status.lastRun)}</Col>
      <Col>
        <label>Next Run</label>
      </Col>
      <Col>{formatDate(status.nextRun)}</Col>
    </Row>
    <Table striped hover>
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
    <Button onClick={onBack}>Back</Button>
    <Button
      onClick={onRun}
      variant="outline-secondary"
      disabled={status.running === true}
      className="ms-2"
    >
      Run
    </Button>
    {items.length > 0 && (
      <Button onClick={onDelete} variant="danger" className="float-end">
        Delete
      </Button>
    )}
  </>
);

export const formatRunning = (r) =>
  r === true ? 'Running' : r === false ? 'Scheduled' : '';

export const formatDate = (s) => {
  if (!s) {
    return 'N/A';
  }

  return new Date(s).toLocaleString();
};
