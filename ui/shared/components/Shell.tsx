import {Container} from 'react-bootstrap';
import {Outlet} from 'react-router';
import {Footer} from './Footer';
import {Header} from './Header';

export function Shell() {
  return (
    <Container>
      <Header />
      <Outlet />
      <Footer />
    </Container>
  );
}
