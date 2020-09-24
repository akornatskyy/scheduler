import React from 'react';
import {Link} from 'react-router-dom';
import {Alert, Navbar, Nav} from 'react-bootstrap';

export const Header = () => (
  <Navbar>
    <Navbar.Brand>Scheduler</Navbar.Brand>
    <Nav>
      <Nav.Link as={Link} to="/collections">
        Collections
      </Nav.Link>
      <Nav.Link as={Link} to="/variables">
        Variables
      </Nav.Link>
      <Nav.Link as={Link} to="/jobs">
        Jobs
      </Nav.Link>
    </Nav>
  </Navbar>
);

export const Layout = ({title, errors, children}) => (
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

const year = new Date().getFullYear();
export const Footer = () => (
  <footer>
    <p className="small text-center text-secondary py-3">
        &copy; { year } 1.1.3 <a className="text-secondary"
        href="https://github.com/akornatskyy/scheduler">Documentation</a>
    </p>
  </footer>
);

export const ErrorSummary = ({errors}) => {
  const message = errors['__ERROR__'];
  if (!message) {
    return null;
  }
  return (
    <Alert variant="danger">
      <h4 className="alert-heading">
        <i className="fa fa-exclamation fs-lg mr-2" aria-hidden="true" />
        {message}
      </h4>
      <p className="mb-0">
        An unexpected error has occurred. Retry your request later, please.
      </p>
    </Alert>
  );
};

export const FieldError = ({message}) => {
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

export const Tip = ({children}) => (
  <small className="d-block mb-3 text-muted">
    <i className="fa fa-bullhorn mr-1" />
    <strong>Tip!</strong> {children}
  </small>
);

function groupBy(items, key) {
  return items.reduce((result, value) => {
    (result[value[key]] = result[value[key]] || []).push(value);
    return result;
  }, {});
}

export const GroupByList = ({groups, items, groupKey, groupRow, itemRow}) => {
  const grouped = groupBy(items, groupKey);
  const rows = [];
  groups.forEach((c) => {
    const itemsByGroup = grouped[c.id];
    if (!itemsByGroup) {
      return;
    }
    rows.push(groupRow(c));
    rows.push(itemsByGroup.map((i) => itemRow(i)));
  });
  return rows;
};
