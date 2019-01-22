import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import DataMap from '../../maps/DataMap';
import BCBaseMap from '../BCBaseMap';


export default class TwoDataMaps extends React.Component {
  static propTypes = {
    region: PropTypes.string,
    historicalTimePeriod: PropTypes.object,
    futureTimePeriod: PropTypes.object,
    season: PropTypes.string,
    variable: PropTypes.string,
  };

  state = {
    viewport: BCBaseMap.initialViewport,
    popup: {
      isOpen: false,
      // position: { lat: 50.0, lng: -123.0 },
      // value: 99,
    },
  };

  handleChangeSelection = (name, value) => this.setState({ [name]: value });
  handleChangeViewport = this.handleChangeSelection.bind(this, 'viewport');
  handleChangePopup = this.handleChangeSelection.bind(this, 'popup');
  // handleChangeViewport = viewport => {
  //   console.log('handleChangeViewport', viewport)
  //   this.setState({ viewport })
  // };

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
            popup={this.state.popup}
            onPopupChange={this.handleChangePopup}
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
            popup={this.state.popup}
            onPopupChange={this.handleChangePopup}
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
