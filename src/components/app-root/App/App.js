import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Card from 'react-bootstrap/Card';

import { filter } from 'lodash/fp';

import regions from '../../../assets/regions';
import timePeriods from '../../../assets/time-periods';
import seasons from '../../../assets/seasons';
import variables from '../../../assets/variables';
import meta from '../../../assets/meta';

import ExternalText, { ExternalTextContext } from '../../../utils/external-text';
import AppHeader from '../AppHeader';

import RegionSelector from '../../selectors/RegionSelector/RegionSelector';
import TimePeriodSelector from '../../selectors/TimePeriodSelector/TimePeriodSelector';
import SeasonSelector from '../../selectors/SeasonSelector/SeasonSelector';
import VariableSelector from '../../selectors/VariableSelector/VariableSelector';
import SelectorLabel from '../../misc/SelectorLabel/SelectorLabel';

import ChangeOverTimeGraph from '../../data-displays/ChangeOverTimeGraph/ChangeOverTimeGraph';
import ImpactsByImpact from '../../data-displays/ImpactsByImpact/ImpactsByImpact';
import ImpactsBySector from '../../data-displays/ImpactsBySector/ImpactsBySector';
import TwoDataMaps from '../../maps/TwoDataMaps/TwoDataMaps';

import styles from './App.css';
import ReactDOM from 'react-dom';

export default class App extends Component {
  state = {
    texts: null,
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

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        texts: { greeting: 'Hello, ${name}' },
      });
    }, 5000);
  }

  render() {
    return (
      <ExternalTextContext.Provider value={this.state.texts}>
        <Container fluid>
          <Row>
            <Col>
              Greeting: <ExternalText item={'greeting'} context={{ name: 'Rod' }}/>
            </Col>
          </Row>

          <AppHeader/>

          <Row>
            <Col xl={2} lg={12} md={12}>
              <Row>
                <Col>{`
                I am interested in information about projected climate change ...
                `}</Col>
              </Row>
              <Row>
                <Col xl={12} lg={'auto'} md={'auto'} className='pr-0'>{`for a typical`}</Col>
                <Col xl={12} lg={2} md={3}>
                  <SeasonSelector
                    value={this.state.season}
                    onChange={this.handleChangeSeason}
                  />
                </Col>
                <Col xl={12} lg={'auto'} md={'auto'} className='pr-0'>{`in`}</Col>
                <Col xl={12} lg={3} md={6}>
                  <RegionSelector
                    value={this.state.region}
                    onChange={this.handleChangeRegion}
                  />
                </Col>
                <Col xl={12} lg={'auto'} md={'auto'} className='pr-0'>{`during the`}</Col>
                <Col xl={12} lg={3} md={4}>
                  <TimePeriodSelector
                    bases={filter(m => +m.start_date >= 2010)(meta)}
                    value={this.state.futureTimePeriod}
                    onChange={this.handleChangeTimePeriod}
                  />
                </Col>
              </Row>
            </Col>

            <Col xl={10} lg={12} md={12}>
              <Tabs
                id={'main'}
                defaultActiveKey={'Maps'}
              >
                <Tab eventKey={'Summary'} title={'Summary'}>
                  <h2>{`
                    Summary of Climate Change 
                    for ${this.state.region.label} 
                    in the ${this.state.futureTimePeriod.value.shorthand}
                  `}</h2>
                </Tab>

                <Tab eventKey={'Impacts'} title={'Impacts'}>
                  <Row>
                    <Col lg={12}>
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
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey={'Maps'} title={`Maps`}>
                  <Row>
                    <Col xs={'auto'} className='pr-0'>
                      {`Show details about`}
                    </Col>
                    <Col sm={4} xs={6}>
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
            </Col>
          </Row>
        </Container>
      </ExternalTextContext.Provider>
    );
  }
}
