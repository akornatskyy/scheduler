import React from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import {
  HashRouter as Router,
  Switch,
  Redirect,
  Route
} from 'react-router-dom';

import Collections from './collections';
import Header from './header';
import Jobs from './jobs';

ReactDOM.render(
    <Container>
      <Router>
        <Header />
        <Switch>
          <Redirect exact path="/" to="/collections" />
          <Route exact path="/collections" component={Collections} />
          <Route exact path="/jobs" component={Jobs} />
        </Switch>
      </Router>
    </Container>,
    document.getElementById('root')
);
