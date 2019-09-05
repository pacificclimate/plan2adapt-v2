import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import T from 'pcic-react-external-text';
import DataMap from '../../maps/DataMap';
import BCBaseMap from '../BCBaseMap';


export default class TwoDataMaps extends React.Component {
  static propTypes = {
    region: PropTypes.string,
    historicalTimePeriod: PropTypes.object,
    futureTimePeriod: PropTypes.object,
    season: PropTypes.string,
    variable: PropTypes.string,
    metadata: PropTypes.array,
  };

  state = {
    viewport: BCBaseMap.initialViewport,
    popup: {
      isOpen: false,
    },
  };

  handleChangeSelection = (name, value) => this.setState({ [name]: value });
  handleChangeViewport = this.handleChangeSelection.bind(this, 'viewport');
  handleChangePopup = this.handleChangeSelection.bind(this, 'popup');

  render() {
    return (
      <Row>
        <Col lg={6}>
          <T path='maps.historical.title' data={{
            start_date: this.props.historicalTimePeriod.start_date,
            end_date: this.props.historicalTimePeriod.end_date
          }}/>
          <DataMap
            viewport={this.state.viewport}
            onViewportChange={this.handleChangeViewport}
            popup={this.state.popup}
            onPopupChange={this.handleChangePopup}
            region={this.props.region}
            season={this.props.season}
            variable={this.props.variable}
            timePeriod={this.props.historicalTimePeriod}
            metadata={this.props.metadata}
          />
        </Col>
        <Col lg={6}>
          <T path='maps.projected.title' data={{
            start_date: this.props.futureTimePeriod.start_date,
            end_date: this.props.futureTimePeriod.end_date
          }}/>
          <DataMap
            viewport={this.state.viewport}
            onViewportChange={this.handleChangeViewport}
            popup={this.state.popup}
            onPopupChange={this.handleChangePopup}
            region={this.props.region}
            season={this.props.season}
            variable={this.props.variable}
            timePeriod={this.props.futureTimePeriod}
            metadata={this.props.metadata}
          />
        </Col>
      </Row>
    );
  }
}
