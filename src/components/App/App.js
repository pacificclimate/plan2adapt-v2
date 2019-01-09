import React, { Component } from 'react';
import {
  Grid, Row, Col, Tabs, Tab, Label, Panel, Table
} from 'react-bootstrap';
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
import SelectorLabel from '../misc/SelectorLabel';

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
            <Panel>
              <Panel.Body>
                <SelectorLabel>I am interested in information about projected climate change ...</SelectorLabel>
                {/*<Label>Region</Label>*/}
                <SelectorLabel>... for the region of</SelectorLabel>
                <RegionSelector
                  value={this.state.region}
                  onChange={this.handleChangeRegion}
                />

                {/*<Label>Time Period</Label>*/}
                <SelectorLabel>... in the future time period</SelectorLabel>
                <TimePeriodSelector
                  value={this.state.timePeriod}
                  onChange={this.handleChangeTimePeriod}
                />

                {/*<Label>Season</Label>*/}
                <SelectorLabel>... showing a typical (average) season</SelectorLabel>
                <SeasonSelector
                  value={this.state.season}
                  onChange={this.handleChangeSeason}
                />

                <SelectorLabel>for that period.</SelectorLabel>

                {/*<Label>Variable of Interest</Label>*/}
                <SelectorLabel>I'd like to see maps and graphs giving details about</SelectorLabel>
                <VariableSelector
                  value={this.state.variable}
                  onChange={this.handleChangeVariable}
                />
              </Panel.Body>
            </Panel>
          </Col>

          <Col lg={10}>
            <Panel>
              <Panel.Body>
                <Tabs
                  id={'main'}
                  defaultActiveKey={'Impacts'}
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
                                <Table bordered hover>
                                  <thead>
                                  <tr>
                                    <th>Impact</th>
                                    <th>Affected Sectors</th>
                                  </tr>
                                  </thead>
                                  <tbody>
                                  {
                                    [0, 1, 2].map(key => (
                                      <tr key={key}>
                                        <td>impact</td>
                                        <td>sectors...</td>
                                      </tr>
                                    ))
                                  }
                                  </tbody>
                                </Table>
                              </Tab>
                              <Tab eventKey={'by-sector'} title={'By Sector'}>
                                <Table bordered hover>
                                  <thead>
                                  <tr>
                                    <th>Sector</th>
                                    <th>Impacts on Sector</th>
                                  </tr>
                                  </thead>
                                  <tbody>
                                  {
                                    [0, 1, 2].map(key => (
                                      <tr key={key}>
                                        <td>sector</td>
                                        <td>impacts...</td>
                                      </tr>
                                    ))
                                  }
                                  </tbody>
                                </Table>
                              </Tab>
                            </Tabs>
                          </Panel.Body>
                        </Panel>
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey={'Maps'} title={`Maps of Historical and Projected ${this.state.variable.label}`}>
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

                  <Tab eventKey={'Graph'} title={`Graph of Change over Time of Projected ${this.state.variable.label}`}>
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

export default App;
