import type {Errors} from '$shared/errors';
import React from 'react';
import {ErrorSummary} from './ErrorSummary';

type Props = {
  title: string;
  errors?: Errors;
  children: React.ReactNode;
};

export const Layout = ({title, errors, children}: Props) => {
  const message = errors?.__ERROR__;
  return (
    <>
      <h1>{title}</h1>
      <hr />
      <article>
        {message && <ErrorSummary message={message} />}
        {children}
      </article>
    </>
  );
};
