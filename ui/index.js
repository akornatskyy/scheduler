import React from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import {
  HashRouter as Router,
  Switch,
  Redirect,
  Route
} from 'react-router-dom';

ReactDOM.render(
    <Container>
      <Router>
        <Switch>
          <Redirect exact path="/" to="/collections" />
          <Route
            exact
            path="/collections"
            component={() => <h1>Scheduler UI</h1>}
          />
        </Switch>
      </Router>
    </Container>,
    document.getElementById('root')
);
