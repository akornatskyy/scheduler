import {Container} from 'react-bootstrap';
import {Outlet} from 'react-router';
import {Footer} from './Footer';
import {Header} from './Header';
import {ProgressLoader} from './ProgressLoader';

export function Shell() {
  return (
    <Container>
      <ProgressLoader />
      <Header />
      <Outlet />
      <Footer />
    </Container>
  );
}
