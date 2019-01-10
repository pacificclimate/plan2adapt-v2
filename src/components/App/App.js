import PropTypes from 'prop-types';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { Route, Redirect, Switch } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

import SketchA from '../sketches/SketchA';

const navSpec = [
  { label: 'Sketch A', path: 'SketchA', component: SketchA },
];


export default class Template extends React.Component {
  static propTypes = {
  };

  state = {
  };

  render() {
    return (
      <Router basename={'/#'}>
        <div>
          <Navbar fluid>
            <Nav>
              {
                navSpec.map(({label, path}) => (
                  <LinkContainer to={`/${path}`}>
                    <NavItem eventKey={path}>
                      {label}
                    </NavItem>
                  </LinkContainer>
                ))
              }
            </Nav>
          </Navbar>

          <Switch>
            {
              navSpec.map(({path, component}) => (
                <Route path={`/${path}`} component={component}/>
              ))
            }
          </Switch>
        </div>
      </Router>
    );
  }
}
