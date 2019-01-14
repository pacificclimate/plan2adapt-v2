import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import DataMap from '../../maps/DataMap';
import BCBaseMap from '../BCBaseMap';


export default class TwoDataMaps extends React.Component {
  static propTypes = {
  };

  state = {
    viewport: BCBaseMap.initialViewport,
  };

  handleChangeViewport = viewport => {
    console.log('handleChangeViewport', viewport)
    this.setState({ viewport })
  };

  render() {
    return (
      <Row>
        <Col lg={6}>
          <h3>Historical: 1961-1990</h3>
          <DataMap
            viewport={this.state.viewport}
            onViewportChange={this.handleChangeViewport}
          />
        </Col>
        <Col lg={6}>
          <h3>Projected: {this.props.timePeriod.label}</h3>
          <DataMap
            viewport={this.state.viewport}
            onViewportChange={this.handleChangeViewport}
          />
        </Col>
      </Row>
    );
  }
}
