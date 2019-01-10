import React, { Component } from 'react';
import {
  Grid, Row, Col, Tabs, Tab, Label, Panel, Table
} from 'react-bootstrap';
import Select from 'react-select';
import regions from '../../../assets/regions';
import timePeriods from '../../../assets/time-periods';
import seasons from '../../../assets/seasons';
import variables from '../../../assets/variables';
import RegionSelector from '../../selectors/RegionSelector/RegionSelector';
import TimePeriodSelector from '../../selectors/TimePeriodSelector/TimePeriodSelector';
import SeasonSelector from '../../selectors/SeasonSelector/SeasonSelector';
import VariableSelector from '../../selectors/VariableSelector/VariableSelector';
import ValueMap from '../../data-displays/ValueMap/ValueMap';
import SelectorLabel from '../../misc/SelectorLabel/SelectorLabel';

import styles from './SketchB.css';
import ChangeOverTimeGraph from '../../data-displays/ChangeOverTimeGraph';
import ImpactsByImpact from '../../data-displays/ImpactsByImpact';
import ImpactsBySector from '../../data-displays/ImpactsBySector';

export default class SketchB extends Component {
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
            <h1>Plan2Adapt v2, Sketch B</h1>
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

                  <Tab eventKey={'Graph'} title={`Graph`}>
                    <Row>
                      <Col lg={2}>
                        <SelectorLabel>Show details about</SelectorLabel>
                        <VariableSelector
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
