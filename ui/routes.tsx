import {JobHistoryPage} from '$features/jobs';
import {Container} from 'react-bootstrap';
import {Navigate, Outlet, RouteObject} from 'react-router';
import {CollectionPage, CollectionsPage} from './features/collections';
import {JobPage, JobsPage} from './features/jobs';
import {VariablePage, VariablesPage} from './features/variables';
import {Footer, Header} from './shared/components';

const Shell = () => (
  <Container>
    <Header />
    <Outlet />
    <Footer />
  </Container>
);

export const routes: RouteObject[] = [
  {
    Component: Shell,
    children: [
      {path: '/', element: <Navigate to="/collections" replace />},
      {path: '/collections', Component: CollectionsPage},
      {path: '/collections/add', Component: CollectionPage},
      {path: '/collections/:id', Component: CollectionPage},
      {path: '/variables', Component: VariablesPage},
      {path: '/variables/add', Component: VariablePage},
      {path: '/variables/:id', Component: VariablePage},
      {path: '/jobs', Component: JobsPage},
      {path: '/jobs/add', Component: JobPage},
      {path: '/jobs/:id/history', Component: JobHistoryPage},
      {path: '/jobs/:id', Component: JobPage},
    ],
  },
];
