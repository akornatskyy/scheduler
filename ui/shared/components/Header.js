import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {Link} from 'react-router-dom';

const Header = () => (
  <Navbar className="mb-4 pl-0">
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

export default Header;
