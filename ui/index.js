import React from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import {
  HashRouter as Router,
  Switch,
  Redirect,
  Route
} from 'react-router-dom';

import Header from './header';

ReactDOM.render(
    <Container>
      <Router>
        <Header />
        <Switch>
          <Redirect exact path="/" to="/collections" />
          <Route
            exact
            path="/collections"
            component={() => <h1>Collections</h1>}
          />
          <Route exact path="/jobs" component={() => <h1>Jobs</h1>} />
        </Switch>
      </Router>
    </Container>,
    document.getElementById('root')
);
