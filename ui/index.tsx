import React from 'react';
import {Container} from 'react-bootstrap';
import {createRoot} from 'react-dom/client';
import {Redirect, Route, HashRouter as Router, Switch} from 'react-router-dom';
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
    <Switch>
      <Redirect exact path="/" to="/collections" />
      <Route exact path="/collections" component={CollectionsContainer} />
      <Route exact path="/collections/add" component={CollectionContainer} />
      <Route exact path="/collections/:id" component={CollectionContainer} />
      <Route exact path="/variables" component={VariablesContainer} />
      <Route exact path="/variables/add" component={VariableContainer} />
      <Route exact path="/variables/:id" component={VariableContainer} />
      <Route exact path="/jobs" component={JobsContainer} />
      <Route exact path="/jobs/add" component={JobContainer} />
      <Route exact path="/jobs/:id" component={JobContainer} />
      <Route exact path="/jobs/:id/history" component={JobHistory} />
    </Switch>
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
