import React from 'react';

type Props = {
  children: React.ReactNode;
};

const Tip = ({children}: Props): React.ReactElement => (
  <small className="d-block mb-3 text-muted">
    <i className="fa fa-bullhorn me-1" />
    <strong>Tip!</strong> {children}
  </small>
);

export default Tip;
