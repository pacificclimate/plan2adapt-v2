import React, { Component } from 'react';
import {
  Grid, Row, Col, Tabs, Tab, Panel,
} from 'react-bootstrap';
import { filter } from 'lodash/fp';
import regions from '../../assets/regions';
import timePeriods from '../../assets/time-periods';
import seasons from '../../assets/seasons';
import variables from '../../assets/variables';
import meta from '../../assets/meta';
import RegionSelector from '../selectors/RegionSelector/RegionSelector';
import TimePeriodSelector from '../selectors/TimePeriodSelector/TimePeriodSelector';
import SeasonSelector from '../selectors/SeasonSelector/SeasonSelector';
import VariableSelector from '../selectors/VariableSelector/VariableSelector';
import SelectorLabel from '../misc/SelectorLabel/SelectorLabel';

import ChangeOverTimeGraph from '../data-displays/ChangeOverTimeGraph/ChangeOverTimeGraph';
import ImpactsByImpact from '../data-displays/ImpactsByImpact/ImpactsByImpact';
import ImpactsBySector from '../data-displays/ImpactsBySector/ImpactsBySector';
import TwoDataMaps from '../maps/TwoDataMaps/TwoDataMaps';

import styles from './App.css';

export default class App extends Component {
  state = {
    region: regions[0],
    futureTimePeriod: timePeriods[0],
    season: seasons[0],
    variable: variables[0],
  };

  handleChangeSelection = (name, value) => this.setState({ [name]: value });
  handleChangeRegion = this.handleChangeSelection.bind(this, 'region');
  handleChangeTimePeriod = this.handleChangeSelection.bind(this, 'futureTimePeriod');
  handleChangeSeason = this.handleChangeSelection.bind(this, 'season');
  handleChangeVariable = this.handleChangeSelection.bind(this, 'variable');

  render() {
    return (
      <Grid fluid>
        <Row>
          <Col lg={12}>
            <h1>Plan2Adapt</h1>
          </Col>
        </Row>

        <Row>
          <Col lg={2}>
            <Panel>
              <Panel.Body>
                <SelectorLabel>I am interested in information about projected climate change ...</SelectorLabel>
                <SelectorLabel>... for the region of</SelectorLabel>
                <RegionSelector
                  value={this.state.region}
                  onChange={this.handleChangeRegion}
                />

                <SelectorLabel>... in the future time period</SelectorLabel>
                <TimePeriodSelector
                  bases={filter(m => +m.start_date >= 2010)(meta)}
                  value={this.state.futureTimePeriod}
                  onChange={this.handleChangeTimePeriod}
                />

                <SelectorLabel>... showing a typical (average)</SelectorLabel>
                <SeasonSelector
                  value={this.state.season}
                  onChange={this.handleChangeSeason}
                />

                <SelectorLabel>for that period.</SelectorLabel>
              </Panel.Body>
            </Panel>
          </Col>

          <Col lg={10}>
            <Panel>
              <Panel.Body>
                <Tabs
                  id={'main'}
                  defaultActiveKey={'Maps'}
                >
                  <Tab eventKey={'Summary'} title={'Summary'}>
                    Summary Content
                  </Tab>

                  <Tab eventKey={'Impacts'} title={'Impacts'}>
                    <Row>
                      <Col lg={12}>
                        <Panel>
                          <Panel.Body>
                            <Tabs
                              id={'impacts'}
                              defaultActiveKey={'by-impact'}
                            >
                              <Tab eventKey={'by-impact'} title={'By Impact'}>
                                <ImpactsByImpact/>
                              </Tab>
                              <Tab eventKey={'by-sector'} title={'By Sector'}>
                                <ImpactsBySector/>
                              </Tab>
                            </Tabs>
                          </Panel.Body>
                        </Panel>
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey={'Maps'} title={`Maps`}>
                    <Row>
                      <Col lg={2}>
                        <SelectorLabel>Show details about</SelectorLabel>
                        <VariableSelector
                          bases={meta}
                          value={this.state.variable}
                          onChange={this.handleChangeVariable}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={12}>
                        <h2>{`
                          ${this.state.season.label}
                          ${this.state.variable.label}
                          for the ${this.state.region.label} region
                        `}</h2>
                      </Col>
                    </Row>
                    <TwoDataMaps
                      region={this.state.region.value}
                      historicalTimePeriod={{
                        start_date: 1961,
                        end_date: 1990,
                      }}
                      futureTimePeriod={this.state.futureTimePeriod.value}
                      season={this.state.season.value}
                      variable={this.state.variable.value}
                    />
                  </Tab>

                  <Tab eventKey={'Graph'} title={`Graph`}>
                    <Row>
                      <Col lg={2}>
                        <SelectorLabel>Show details about</SelectorLabel>
                        <VariableSelector
                          bases={meta}
                          value={this.state.variable}
                          onChange={this.handleChangeVariable}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={12}>
                        <h2>{`
                          Range of projected change in
                          ${this.state.season.label}
                          ${this.state.variable.label}
                          for the ${this.state.region.label} region
                        `}</h2>
                      </Col>
                      <Col lg={6}>
                        <ChangeOverTimeGraph
                          {...this.state}
                        />
                      </Col>
                    </Row>
                  </Tab>
                </Tabs>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}
