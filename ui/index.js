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

ReactDOM.render(
    <Container>
      <Router>
        <Header />
        <Switch>
          <Redirect exact path="/" to="/collections" />
          <Route exact path="/collections" component={Collections} />
          <Route exact path="/jobs" component={() => <h1>Jobs</h1>} />
        </Switch>
      </Router>
    </Container>,
    document.getElementById('root')
);
