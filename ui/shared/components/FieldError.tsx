import React from 'react';

type Props = {
  message?: string;
};

const FieldError = ({message}: Props): React.ReactElement | null => {
  if (!message) {
    return null;
  }

  return (
    <p className="invalid-feedback mb-0">
      <i className="fa fa-exclamation me-1" aria-hidden="true" />
      {message}
    </p>
  );
};

export default FieldError;
