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
      <Nav.Link as={Link} to="/jobs">
        Jobs
      </Nav.Link>
    </Nav>
  </Navbar>
);

export const Layout = ({title, children}) => (
  <div>
    <h1>
      {title}
    </h1>
    <hr />
    <article>
      {children}
    </article>
  </div>
);

const year = new Date().getFullYear();
export const Footer = () => (
  <footer>
    <p className="small text-center text-secondary py-3">
        &copy; { year } 1.0.0 <a className="text-secondary" href="https://github.com/akornatskyy/scheduler">Documentation</a>
    </p>
  </footer>
);

const Summary = ({errors}) => {
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

const Field = ({message}) => {
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

export const Errors = {
  Summary: Summary,
  Field: Field
};
