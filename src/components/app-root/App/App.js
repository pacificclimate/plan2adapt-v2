import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

import filter from 'lodash/fp/filter';
import get from 'lodash/fp/get';

import { fetchSummaryMetadata } from '../../../data-services/metadata';
import regions from '../../../assets/regions';
import summary from '../../../assets/summary';
import rulebase from '../../../assets/rulebase';
import ruleValues from '../../../assets/rule-results';

import T, { ExternalTextContext } from 'pcic-react-external-text';
import AppHeader from '../AppHeader';

import RegionSelector from '../../selectors/RegionSelector/RegionSelector';
import TimePeriodSelector from '../../selectors/TimePeriodSelector';
import SeasonSelector from '../../selectors/SeasonSelector';
import VariableSelector from '../../selectors/VariableSelector';
import SelectorLabel from '../../misc/SelectorLabel';

import ChangeOverTimeGraph from '../../data-displays/ChangeOverTimeGraph';
import Impacts from '../../data-displays/impacts/Impacts';
import Rules from '../../data-displays/impacts/Rules';
import TwoDataMaps from '../../maps/TwoDataMaps/TwoDataMaps';

import styles from './App.css';
import Summary from '../../data-displays/Summary';

const baselineTimePeriod = {
  start_date: 1961,
  end_date: 1990,
};

export default class App extends Component {
  state = {
    metadata: null,
    region: regions[0],
    futureTimePeriod: undefined,
    season: undefined,
    variable: undefined,
  };

  componentDidMount() {
    fetchSummaryMetadata()
      .then(metadata => this.setState({ metadata }))
  }

  handleChangeSelection = (name, value) => this.setState({ [name]: value });
  handleChangeRegion = this.handleChangeSelection.bind(this, 'region');
  handleChangeTimePeriod = this.handleChangeSelection.bind(this, 'futureTimePeriod');
  handleChangeSeason = this.handleChangeSelection.bind(this, 'season');
  handleChangeVariable = this.handleChangeSelection.bind(this, 'variable');

  render() {
    // TODO: Extract various parts of this to components to reduce the nesting
    // level. But not until we are pretty sure we have settled this arrangement,
    // since extraction means introducing extra machinery for state-setting
    // callbacks, etc.
    if (this.state.metadata === null) {
      console.log('Loading metadata...')
      return (<h1>Loading metadata...</h1>);
    }
    console.log('Metadata loaded')
    const futureTimePeriod =
      get('futureTimePeriod.value.representative', this.state) || {};
    return (
      // We introduce a consumer for external texts context so we can use
      // T.get easily (it needs the context (`texts`) as an argument).
      <ExternalTextContext.Consumer>
        {texts => (
          <Container fluid>
            <AppHeader/>

            <Row>
              <Col xl={2} lg={12} md={12}>
                {/* TODO: Extract this as a separate component? */}
                <div className='MainSelectors'>
                  <Row>
                    <Col>
                      <T path='mainSelectors.prologue'/>
                    </Col>
                  </Row>
                  <Row>
                    <Col xl={12} lg={'auto'} md={'auto'} className='pr-0'>
                      <T path='mainSelectors.seasonPrefix'/>
                    </Col>
                    <Col xl={12} lg={2} md={3}>
                      <SeasonSelector
                        value={this.state.season}
                        onChange={this.handleChangeSeason}
                      />
                    </Col>
                    <Col xl={12} lg={'auto'} md={'auto'} className='pr-0'>
                      <T path='mainSelectors.regionPrefix'/>
                    </Col>
                    <Col xl={12} lg={3} md={6}>
                      <RegionSelector
                        value={this.state.region}
                        onChange={this.handleChangeRegion}
                      />
                    </Col>
                    <Col xl={12} lg={'auto'} md={'auto'} className='pr-0'>
                      <T path='mainSelectors.periodPrefix'/>
                    </Col>
                    <Col xl={12} lg={3} md={4}>
                      <TimePeriodSelector
                        bases={filter(m => +m.start_date >= 2010)(this.state.metadata)}
                        value={this.state.futureTimePeriod}
                        onChange={this.handleChangeTimePeriod}
                        debug
                      />
                    </Col>
                  </Row>
                </div>
              </Col>

              <Col xl={10} lg={12} md={12}>
                <Tabs
                  id={'main'}
                  // Not sure why this doesn't work. Annoying.
                  // defaultActiveKey={T.get(texts, 'app.tabs.defaultActiveKey')}
                  defaultActiveKey='Summary'
                >
                  <Tab
                    eventKey={T.get(texts, 'summary.tab')}
                    title={<T as='string' path='summary.tab'/>}
                    className='pt-2'
                  >
                    <Summary summary={summary}/>
                    <T path='summary.notes.general' data={{
                      region: this.state.region.label,
                      futureTimePeriod: futureTimePeriod,
                      baselineTimePeriod,
                    }}/>
                    <T path='summary.notes.derivedVars'/>
                  </Tab>

                  <Tab
                    eventKey={T.get(texts, 'impacts.tab')}
                    title={<T as='string' path='impacts.tab'/>}
                    className='pt-2'
                  >
                    <Row>
                      <Col lg={12}>
                        <T path='impacts.prologue' data={{
                          region: this.state.region.label,
                          futureTimePeriod: futureTimePeriod,
                          baselineTimePeriod,
                        }}/>
                        <Tabs
                          id={'impacts'}
                          defaultActiveKey={'rules'}
                        >
                          <Tab
                            eventKey={'by-category'}
                            title={'By Category'}
                            className='pt-2'
                          >
                            <Impacts
                              rulebase={rulebase}
                              ruleValues={ruleValues}
                              groupKey='category'
                              itemKey='sector'
                              groupHeading='Impact Category'
                              itemsHeading='Affected Sectors'
                            />
                          </Tab>
                          <Tab
                            eventKey={'by-sector'}
                            title={'By Sector'}
                            className='pt-2'
                          >
                            <Impacts
                              rulebase={rulebase}
                              ruleValues={ruleValues}
                              groupKey='sector'
                              itemKey='category'
                              groupHeading='Affected Sector'
                              itemsHeading='Impact Categories'
                            />
                          </Tab>
                          <Tab
                            eventKey={'rules'}
                            title={'Rules Logic'}
                            className='pt-2'
                          >
                            <Rules
                              rulebase={rulebase}
                              ruleValues={ruleValues}
                            />
                          </Tab>
                        </Tabs>
                      </Col>
                    </Row>
                  </Tab>

                  {/*
                  <Tab mountOnEnter> prevents premature initialization of
                  maps leading to incorrect appearance until window is resized.
                  */}
                  <Tab
                    eventKey={T.get(texts, 'maps.tab')}
                    title={<T as='string' path='maps.tab'/>}
                    className='pt-2'
                    mountOnEnter
                  >
                    <Row>
                      <Col xs={'auto'} className='pr-0'>
                        <T path='fragments.variablePrefix'/>
                      </Col>
                      <Col sm={4} xs={6}>
                        <VariableSelector
                          bases={this.state.metadata}
                          value={this.state.variable}
                          onChange={this.handleChangeVariable}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={12}>
                        <T path='maps.title' data={{
                          season: get('label', this.state.season),
                          variable: get('label', this.state.variable),
                          region: this.state.region.label,
                        }}/>
                      </Col>
                    </Row>
                    <TwoDataMaps
                      region={this.state.region.value}
                      historicalTimePeriod={{
                        start_date: 1961,
                        end_date: 1990,
                      }}
                      futureTimePeriod={futureTimePeriod}
                      season={get('value', this.state.season)}
                      variable={get('value', this.state.variable)}
                      metadata={this.state.metadata}
                    />
                  </Tab>

                  <Tab
                    eventKey={T.get(texts, 'graph.tab')}
                    title={<T as='string' path='graph.tab'/>}
                    className='pt-2'
                  >
                    <Row>
                      <Col lg={2}>
                        <T path='fragments.variablePrefix'/>
                        <VariableSelector
                          bases={this.state.metadata}
                          value={this.state.variable}
                          onChange={this.handleChangeVariable}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={12}>
                        <T path='graph.title' data={{
                          season: get('label', this.state.season),
                          variable: get('label', this.state.variable),
                          region: this.state.region.label,
                        }}/>
                      </Col>
                      <Col lg={6}>
                        <ChangeOverTimeGraph
                          {...this.state}
                        />
                      </Col>
                    </Row>
                  </Tab>

                  <Tab
                    eventKey={T.get(texts, 'notes.tab')}
                    title={<T as='string' path='notes.tab'/>}
                    className='pt-2'
                  >
                    <T path='notes.content'/>
                  </Tab>

                  <Tab
                    eventKey={T.get(texts, 'references.tab')}
                    title={<T as='string' path='references.tab'/>}
                    className='pt-2'
                  >
                    <T path='references.content'/>
                  </Tab>
                </Tabs>
              </Col>
            </Row>
          </Container>
        )}
      </ExternalTextContext.Consumer>
    );
  }
}
