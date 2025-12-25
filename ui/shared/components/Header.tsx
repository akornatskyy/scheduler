import {Nav, Navbar} from 'react-bootstrap';
import {Link} from 'react-router';

export const Header = () => (
  <Navbar className="mb-3">
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
