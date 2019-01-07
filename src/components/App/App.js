import React, { Component } from 'react';
import { Grid, Row, Col, Tabs, Tab, Label } from 'react-bootstrap';
import Select from 'react-select';
import regions from '../../assets/regions';
import timePeriods from '../../assets/time-periods';
import seasons from '../../assets/seasons';
import variables from '../../assets/variables';
import RegionSelector from '../selectors/RegionSelector';
import TimePeriodSelector from '../selectors/TimePeriodSelector';
import SeasonSelector from '../selectors/SeasonSelector';
import VariableSelector from '../selectors/VariableSelector';
import ValueMap from '../data-displays/ValueMap';

import styles from './App.css';
import ChangeOverTimeGraph from '../data-displays/ChangeOverTimeGraph';

class App extends Component {
  state = {
    region: regions[0],
    timePeriod: timePeriods[0],
    season: seasons[0],
    variable: variables[0],
  };

  handleChangeSelection = (name, value) => this.setState({ [name]: value });
  handleChangeRegion = this.handleChangeSelection.bind(this, 'region');
  handleChangeTimePeriod = this.handleChangeSelection.bind(this, 'timePeriod');
  handleChangeSeason = this.handleChangeSelection.bind(this, 'season');
  handleChangeVariable = this.handleChangeSelection.bind(this, 'variable');

  render() {
    return (
      <Grid fluid>
        <Row>
          <Col lg={12}>
            <h1>Plan2Adapt v2</h1>
          </Col>
        </Row>

        <Row>
          <Col lg={2}>
            <Label>Region</Label>
            <RegionSelector
              value={this.state.region}
              onChange={this.handleChangeRegion}
            />

            <Label>Time Period</Label>
            <TimePeriodSelector
              value={this.state.timePeriod}
              onChange={this.handleChangeTimePeriod}
            />

            <Label>Season</Label>
            <SeasonSelector
              value={this.state.season}
              onChange={this.handleChangeSeason}
            />

            <Label>Variable of Interest</Label>
            <VariableSelector
              value={this.state.variable}
              onChange={this.handleChangeVariable}
            />
          </Col>

          <Col lg={10}>
            <Tabs
              id={'main'}
              defaultActiveKey={'Maps'}>
              <Tab eventKey={'Summary'} title={'Summary'}>
                Summary Content
              </Tab>
              <Tab eventKey={'Maps'} title={`Projected ${this.state.variable.label}: Maps`}>
                <Row>
                  <Col lg={12}>
                    <h2>{`
                      ${this.state.season.label}
                      ${this.state.variable.label}
                      for the ${this.state.region.label} region
                    `}</h2>
                  </Col>
                </Row>
                <Row>
                  <Col lg={6}>
                    <h3>Historical: 1961-1990</h3>
                    <ValueMap
                      {...this.state}
                      timePeriod={{
                        label: 'Baseline (1961-1990)'
                      }}
                    />
                  </Col>
                  <Col lg={6}>
                    <h3>Projected: {this.state.timePeriod.label}</h3>
                    <ValueMap
                      {...this.state}
                    />
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey={'Graph'} title={`Projected ${this.state.variable.label}: Change over Time`}>
                <Row>
                  <Col lg={6}>
                    <h2>{`
                      Range of projected change in
                      ${this.state.season.label}
                      ${this.state.variable.label}
                      for the ${this.state.region.label} region
                    `}</h2>
                    <ChangeOverTimeGraph
                      {...this.state}
                    />
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey={'Impacts'} title={'Impacts'}>
                Impacts Content
              </Tab>
            </Tabs>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default App;
