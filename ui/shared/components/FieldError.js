import React from 'react';

const FieldError = ({message}) => {
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

export default FieldError;
