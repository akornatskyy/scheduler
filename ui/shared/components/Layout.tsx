import React from 'react';
import ErrorSummary from './ErrorSummary';

type Props = {
  title: string;
  errors: Record<string, string>;
  children: React.ReactNode;
};

const Layout = ({title, errors, children}: Props): React.ReactElement => (
  <>
    <h1>{title}</h1>
    <hr />
    <article>
      <ErrorSummary errors={errors} />
      {children}
    </article>
  </>
);

export default Layout;
