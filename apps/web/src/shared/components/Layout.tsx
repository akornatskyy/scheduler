import type {Errors} from '$shared/errors';
import {useSignal} from '$shared/hooks';
import {$isPending} from '$shared/signals';
import React from 'react';
import {ErrorSummary} from './ErrorSummary';

type Props = {
  title: string;
  errors?: Errors;
  children: React.ReactNode;
};

export const Layout = ({title, errors, children}: Props) => {
  const pending = useSignal($isPending);

  const message = errors?.__ERROR__;
  return (
    <>
      <h1>{title}</h1>
      <hr />
      <article aria-busy={pending}>
        {message && <ErrorSummary message={message} />}
        {children}
      </article>
    </>
  );
};
