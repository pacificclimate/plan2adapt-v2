import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import DataMap from '../../maps/DataMap';
import BCBaseMap from '../BCBaseMap';
import seasons from '../../../assets/seasons';


export default class TwoDataMaps extends React.Component {
  static propTypes = {
    region: PropTypes.object,
    historicalTimePeriod: PropTypes.object,
    futureTimePeriod: PropTypes.object,
    season: PropTypes.object,
    variable: PropTypes.object,
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
          <h3>{`
            Historical:
            ${this.props.historicalTimePeriod.start_date}-
            ${this.props.historicalTimePeriod.end_date}
            `}</h3>
          <DataMap
            viewport={this.state.viewport}
            onViewportChange={this.handleChangeViewport}
            region={this.props.region}
            season={this.props.season}
            variable={this.props.variable}
            timePeriod={this.props.historicalTimePeriod}
          />
        </Col>
        <Col lg={6}>
          <h3>{`
            Projected:
            ${this.props.futureTimePeriod.start_date}-
            ${this.props.futureTimePeriod.end_date}
          `}</h3>
          <DataMap
            viewport={this.state.viewport}
            onViewportChange={this.handleChangeViewport}
            region={this.props.region}
            season={this.props.season}
            variable={this.props.variable}
            timePeriod={this.props.futureTimePeriod}
          />
        </Col>
      </Row>
    );
  }
}
