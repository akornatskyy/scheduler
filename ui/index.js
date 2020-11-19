import React from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import {
  HashRouter as Router,
  Switch,
  Redirect,
  Route
} from 'react-router-dom';

import Collection from './features/collection/collection';
import Collections from './features/collections/collections';
import Job from './features/job/job';
import JobHistory from './features/history/history';
import Jobs from './features/jobs/jobs';
import Variable from './features/variable/variable';
import Variables from './features/variables/variables';
import {Header, Footer} from './shared/components';

export const App = () => (
  <Container>
    <Header />
    <Switch>
      <Redirect exact path="/" to="/collections" />
      <Route exact path="/collections" component={Collections} />
      <Route exact path="/collections/add" component={Collection} />
      <Route exact path="/collections/:id" component={Collection} />
      <Route exact path="/variables" component={Variables} />
      <Route exact path="/variables/add" component={Variable} />
      <Route exact path="/variables/:id" component={Variable} />
      <Route exact path="/jobs" component={Jobs} />
      <Route exact path="/jobs/add" component={Job} />
      <Route exact path="/jobs/:id" component={Job} />
      <Route exact path="/jobs/:id/history" component={JobHistory} />
    </Switch>
    <Footer />
  </Container>
);

ReactDOM.render(
    <Router><App /></Router>,
    document.getElementById('root') || document.createElement('div')
);
