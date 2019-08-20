import React from 'react';

const year = new Date().getFullYear();

const Layout = ({title, children}) => (
  <div>
    <h1>
      {title}
    </h1>
    <hr />
    <article>
      {children}
    </article>
    <footer>
      <p className="small text-center text-secondary py-3">
        &copy; { year } 1.0.0 <a className="text-secondary" href="https://github.com/akornatskyy/scheduler">Documentation</a>
      </p>
    </footer>
  </div>
);

export default Layout;
