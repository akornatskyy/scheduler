import React from 'react';
import Alert from 'react-bootstrap/Alert';

const ErrorSummary = ({errors}) => {
  const message = errors['__ERROR__'];
  if (!message) {
    return null;
  }
  return (
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
};

export default ErrorSummary;
