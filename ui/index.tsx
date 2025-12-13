import React from 'react';
import {Container} from 'react-bootstrap';
import {createRoot} from 'react-dom/client';
import {Navigate, Route, HashRouter as Router, Routes} from 'react-router-dom';
import CollectionContainer from './features/collection/collection';
import CollectionsContainer from './features/collections/collections';
import JobHistory from './features/history/history';
import JobContainer from './features/job/job';
import JobsContainer from './features/jobs/jobs';
import VariableContainer from './features/variable/variable';
import VariablesContainer from './features/variables/variables';
import {Footer, Header} from './shared/components';

export const App = (): React.ReactElement => (
  <Container>
    <Header />
    <Routes>
      <Route path="/" element={<Navigate to="/collections" replace />} />
      <Route path="/collections" element={<CollectionsContainer />} />
      <Route path="/collections/add" element={<CollectionContainer />} />
      <Route path="/collections/:id" element={<CollectionContainer />} />
      <Route path="/variables" element={<VariablesContainer />} />
      <Route path="/variables/add" element={<VariableContainer />} />
      <Route path="/variables/:id" element={<VariableContainer />} />
      <Route path="/jobs" element={<JobsContainer />} />
      <Route path="/jobs/add" element={<JobContainer />} />
      <Route path="/jobs/:id/history" element={<JobHistory />} />
      <Route path="/jobs/:id" element={<JobContainer />} />
    </Routes>
    <Footer />
  </Container>
);

const root = createRoot(
  document.querySelector('#root') || document.createElement('div'),
);
root.render(
  <Router>
    <App />
  </Router>,
);
