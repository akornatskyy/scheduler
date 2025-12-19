import React from 'react';

type Props = {
  children: React.ReactNode;
};

export const Tip = ({children}: Props) => (
  <small className="d-block mb-3 text-muted">
    <i className="fa fa-bullhorn me-1" />
    <strong>Tip!</strong> {children}
  </small>
);
