import {Button, Col, Row, Table} from 'react-bootstrap';
import type {JobHistory, JobStatus} from '../types';
import {formatDate, formatRunning} from './utils';

type Props = {
  status: JobStatus;
  items: JobHistory[];
  onBack?: () => void;
  onRun?: () => void;
  onDelete?: () => void;
};

export const JobHistoryTable = ({
  status,
  items,
  onBack,
  onRun,
  onDelete,
}: Props) => (
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
