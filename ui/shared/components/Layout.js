import React from 'react';

import ErrorSummary from './ErrorSummary';

const Layout = ({title, errors, children}) => (
  <>
    <h1>
      {title}
    </h1>
    <hr />
    <article>
      <ErrorSummary errors={errors} />
      {children}
    </article>
  </>
);

export default Layout;
