import {Container} from 'react-bootstrap';
import {Navigate, Outlet, RouteObject} from 'react-router';
import {CollectionContainer} from './features/collection';
import {CollectionsContainer} from './features/collections';
import {JobHistoryContainer} from './features/history';
import {JobContainer} from './features/job';
import {JobsContainer} from './features/jobs';
import {VariableContainer} from './features/variable';
import {VariablesContainer} from './features/variables';
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
      {path: '/collections', Component: CollectionsContainer},
      {path: '/collections/add', Component: CollectionContainer},
      {path: '/collections/:id', Component: CollectionContainer},
      {path: '/variables', Component: VariablesContainer},
      {path: '/variables/add', Component: VariableContainer},
      {path: '/variables/:id', Component: VariableContainer},
      {path: '/jobs', Component: JobsContainer},
      {path: '/jobs/add', Component: JobContainer},
      {path: '/jobs/:id/history', Component: JobHistoryContainer},
      {path: '/jobs/:id', Component: JobContainer},
    ],
  },
];
