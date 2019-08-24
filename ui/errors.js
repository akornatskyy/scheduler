import React from 'react';
import {Alert} from 'react-bootstrap';

const Summary = ({errors}) => {
  const message = errors['__ERROR__'];
  if (!message) {
    return null;
  }
  return (
    <Alert variant="danger">
      <h4 className="alert-heading">
        <i className="fa fa-exclamation fs-lg mr-2" aria-hidden="true" />
        {message}
      </h4>
      <p className="mb-0">
        An unexpected error has occurred. Retry your request later, please.
      </p>
    </Alert>
  );
};

const Field = ({message}) => {
  if (!message) {
    return null;
  }
  return (
    <p className="invalid-feedback mb-0">
      <i className="fa fa-exclamation mr-1" aria-hidden="true" />
      {message}
    </p>
  );
};

export default {
  Summary: Summary,
  Field: Field
};
