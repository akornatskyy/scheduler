import React from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import {
  HashRouter as Router,
  Switch,
  Redirect,
  Route
} from 'react-router-dom';

import Collection from './collection';
import Collections from './collections';
import {Header, Footer} from './shared';
import Job from './job';
import Jobs from './jobs';

ReactDOM.render(
    <Container>
      <Router>
        <Header />
        <Switch>
          <Redirect exact path="/" to="/collections" />
          <Route exact path="/collections" component={Collections} />
          <Route exact path="/jobs" component={Jobs} />
          <Route exact path="/collections/add" component={Collection} />
          <Route exact path="/collections/:id" component={Collection} />
          <Route exact path="/jobs/add" component={Job} />
          <Route exact path="/jobs/:id" component={Job} />
        </Switch>
      </Router>
      <Footer />
    </Container>,
    document.getElementById('root')
);
