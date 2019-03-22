import PropTypes from 'prop-types';
import React from 'react';
import {
  Row, Col,
} from 'react-bootstrap';
import pcicLogo from '../../../assets/pcic-logo.png';
import p2aLogo from '../../../assets/p2a-logo.png';
import css from './AppHeader.css';

export default class AppHeader extends React.Component {
  static propTypes = {
  };

  render() {
    return (
      <Row className={'AppHeader'}>
        <Col lg={12}>
          <a href='https://pacificclimate.org/' className={'logo'}>
            <img
              src={pcicLogo}
              width='328'
              height='38'
              alt='Pacific Climate Impacts Consortium'
            />
          </a>
          <a href='#'>
            <img
              src={p2aLogo}
              width='328'
              height='38'
              alt='Pacific Climate Impacts Consortium'
            />
          </a>
        </Col>
      </Row>
    );
  }
}
