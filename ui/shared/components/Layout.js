import React from 'react';

import ErrorSummary from './ErrorSummary';

const Layout = ({title, errors, children}) => (
  <div>
    <h1>
      {title}
    </h1>
    <hr />
    <article>
      <ErrorSummary errors={errors} />
      {children}
    </article>
  </div>
);

export default Layout;
