import {createRoot} from 'react-dom/client';
import {createHashRouter} from 'react-router';
import {RouterProvider} from 'react-router/dom';
import {routes} from './routes';

const router = createHashRouter(routes);
createRoot(document.querySelector('#root')!).render(
  <RouterProvider router={router} />,
);
