import {Alert} from 'react-bootstrap';

type Props = {
  message: string;
};

export const ErrorSummary = ({message}: Props) => (
  <Alert variant="danger">
    <h4 className="alert-heading">
      <i className="fa fa-exclamation fs-lg me-2" aria-hidden="true" />
      {message}
    </h4>
    <p className="mb-0">
      An unexpected error has occurred. Retry your request later, please.
    </p>
  </Alert>
);
