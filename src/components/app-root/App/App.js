import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Loader from 'react-loader';

import filter from 'lodash/fp/filter';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import includes from 'lodash/fp/includes';

import { fetchSummaryMetadata } from '../../../data-services/metadata';
import { middleDecade } from '../../../utils/time-periods';
import rulebase from '../../../assets/rulebase';

import T from '../../../temporary/external-text';
import AppHeader from '../AppHeader';

import RegionSelector from '../../selectors/RegionSelector/RegionSelector';
import TimePeriodSelector from '../../selectors/TimePeriodSelector';
import SeasonSelector from '../../selectors/SeasonSelector';
import VariableSelector from '../../selectors/VariableSelector';

import Summary from '../../data-displays/Summary';
import ChangeOverTimeGraph from '../../graphs/ChangeOverTimeGraph';
import ImpactsTab from '../../data-displays/impacts/ImpactsTab';
import TwoDataMaps from '../../maps/TwoDataMaps/TwoDataMaps';

import Cards from '../../misc/Cards';
import DevColourbar from '../../data-displays/DevColourbar';
import DevGraph from '../../data-displays/DevGraph';

const baselineTimePeriod = {
  start_date: 1961,
  end_date: 1990,
};

export default class App extends Component {
  static contextType = T.contextType;
  getConfig = path => T.get(this.context, path, {}, 'raw');

  state = {
    metadata: null,
    region: undefined,
    futureTimePeriod: undefined,
    season: undefined,
    variable: undefined,
    tabKey: 'graphs',
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
  handleChangeTab = this.handleChangeSelection.bind(this, 'tabKey');

    selectorEnabled = name =>
    includes(this.state.tabKey)(this.getConfig(`selectors.${name}.forTabs`));

  render() {
    // TODO: Extract various parts of this to components to reduce the nesting
    // level. But not until we are pretty sure we have settled this arrangement,
    // since extraction means introducing extra machinery for state-setting
    // callbacks, etc.

    const texts = this.context;
    if (!texts || this.state.metadata === null) {
      console.log('### Loading ...')
      return <Loader/>;
    }
    console.log('### Loaded')
    const variableConfig = this.getConfig('variables');

    const futureTimePeriod =
      get('futureTimePeriod.value.representative', this.state) || {};
    const region = get('region.label', this.state) || '';

    // TODO: Inline
    const variableSelectorProps = {
      bases: this.state.metadata,
      value: this.state.variable,
      default: this.getConfig('selectors.variable.default'),
      onChange: this.handleChangeVariable,
      getOptionLabel: ({ value: { representative: { variable_id }}}) =>
        `${variableConfig[variable_id].label}`,
    };
    const seasonSelectorProps = {
      value: this.state.season,
      default: this.getConfig('selectors.season.default'),
      onChange: this.handleChangeSeason,
    };

    return (
      <Container fluid>
        <AppHeader/>

        <Row>
          <Col xl={2} lg={12} md={12}>
            <div className='MainSelectors'>
              <Row>
                <Col>
                  <T path='selectors.prologue'/>
                </Col>
              </Row>
              <Row>
                {
                  this.selectorEnabled('region') && <React.Fragment>
                    <Col xl={12} lg={'auto'} md={'auto'} className='pr-0'>
                      <T path='selectors.region.prefix'/>
                    </Col>
                    <Col xl={12} lg={3} md={6}>
                      <RegionSelector
                        default={T.get(texts, 'selectors.region.default', {}, 'raw')}
                        value={this.state.region}
                        onChange={this.handleChangeRegion}
                      />
                    </Col>
                  </React.Fragment>
                }

                {
                  this.selectorEnabled('timePeriod') && <React.Fragment>
                    <Col xl={12} lg={'auto'} md={'auto'} className='pr-0'>
                      <T path='selectors.timePeriod.prefix'/>
                    </Col>
                    <Col xl={12} lg={3} md={4}>
                      <TimePeriodSelector
                        bases={filter(m => +m.start_date >= 2010)(this.state.metadata)}
                        value={this.state.futureTimePeriod}
                        default={T.get(texts, 'selectors.timePeriod.default', {}, 'raw')}
                        onChange={this.handleChangeTimePeriod}
                        debug
                      />
                    </Col>
                  </React.Fragment>
                }

                {
                  this.selectorEnabled('variable') && <React.Fragment>
                    <Col xl={12} lg={'auto'} md={'auto'} className='pr-0'>
                      <T path='selectors.variable.prefix'/>
                    </Col>
                    <Col xl={12} lg={3} md={4}>
                      <VariableSelector
                        {...variableSelectorProps}
                      />
                    </Col>
                  </React.Fragment>
                }

                {
                  this.selectorEnabled('season') && <React.Fragment>
                    <Col xl={12} lg={'auto'} md={'auto'} className='pr-0'>
                      <T path='selectors.season.prefix'/>
                    </Col>
                    <Col xl={12} lg={3} md={4}>
                      <SeasonSelector
                        {...seasonSelectorProps}
                      />
                    </Col>
                    <Col xl={12} lg={'auto'} md={'auto'} className='pr-0'>
                      <T path='selectors.season.postfix'/>
                    </Col>
                  </React.Fragment>
                }
              </Row>
            </div>
          </Col>

          <Col xl={10} lg={12} md={12}>
            <Tabs
              id={'main'}
              activeKey={this.state.tabKey}
              onSelect={this.handleChangeTab}
            >
              {this.getConfig('dev-graph.visible') &&
              <Tab
                eventKey={'dev-graph'}
                title={'Dev Graph'}
                className='pt-2'
                mountOnEnter
              >
                <DevGraph/>
              </Tab>
              }

              {this.getConfig('dev-colourbar.visible') &&
              <Tab
                eventKey={'dev-colourbar'}
                title={'Dev Colourbar'}
                className='pt-2'
                mountOnEnter
              >
                <DevColourbar
                  season={get('value', this.state.season)}
                  variable={get('value', this.state.variable)}
                />
              </Tab>
              }

              <Tab
                eventKey={'summary'}
                title={<T as='string' path='summary.tab'/>}
                disabled={this.getConfig('summary.disabled')}
                className='pt-2'
                mountOnEnter
              >
                {
                  this.state.tabKey === 'summary' &&
                  <React.Fragment>
                    <T path='summary.notes.general' data={{
                      region: region,
                      baselineTimePeriod,
                      futureTimePeriod,
                      futureDecade: middleDecade(futureTimePeriod),
                      baselineDecade: middleDecade(baselineTimePeriod),
                    }}/>
                    <Summary
                      region={get('value', this.state.region)}
                      futureTimePeriod={futureTimePeriod}
                      tableContents={this.getConfig('summary.table.contents')}
                      variableConfig={this.getConfig('variables')}
                      unitsConversions={this.getConfig('units')}
                    />
                    <T path='summary.notes.derivedVars'/>
                  </React.Fragment>
                }
              </Tab>

              <Tab
                eventKey={'impacts'}
                title={<T as='string' path='impacts.tab'/>}
                disabled={this.getConfig('impacts.disabled')}
                className='pt-2'
                mountOnEnter
              >
                {
                  this.state.tabKey === 'impacts' &&
                  <React.Fragment>
                    <Row>
                      <Col lg={12}>
                        <T path='impacts.prologue' data={{
                          region: region,
                          futureDecade: middleDecade(futureTimePeriod),
                          baselineDecade: middleDecade(baselineTimePeriod),
                        }}/>
                        <ImpactsTab
                          rulebase={rulebase}
                          region={get('value', this.state.region)}
                          futureTimePeriod={futureTimePeriod}
                        />
                      </Col>
                    </Row>
                  </React.Fragment>
                }
              </Tab>

              {/*
              <Tab mountOnEnter> prevents premature initialization of
              maps leading to incorrect appearance until window is resized.
              */}
              <Tab
                eventKey={'maps'}
                title={<T as='string' path='maps.tab'/>}
                disabled={this.getConfig('maps.disabled')}
                className='pt-2'
                mountOnEnter
              >
                {
                  this.state.tabKey === 'maps' &&
                  <TwoDataMaps
                    region={get('value', this.state.region)}
                    historicalTimePeriod={baselineTimePeriod}
                    futureTimePeriod={futureTimePeriod}
                    season={get('value', this.state.season)}
                    variable={get('value', this.state.variable)}
                    metadata={this.state.metadata}
                  />
                }
              </Tab>

              <Tab
                eventKey={'graphs'}
                title={<T as='string' path='graphs.tab'/>}
                disabled={this.getConfig('graphs.disabled')}
                className='pt-2'
                mountOnEnter
              >
                {
                  this.state.tabKey === 'graphs' &&
                  <React.Fragment>
                    <Row>
                      <Col lg={12}>
                        <T path='graphs.title' data={{
                          season: get('label', this.state.season),
                          variable: get('label', this.state.variable),
                          region: get('label', this.state.region),
                        }}/>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={12}>
                        <ChangeOverTimeGraph
                          region={get('value', this.state.region)}
                          historicalTimePeriod={baselineTimePeriod}
                          season={get('value', this.state.season)}
                          variable={get('value', this.state.variable)}
                          // TODO: This may be better obtained from metadata
                          futureTimePeriods={
                            this.getConfig('graphs.config.futureTimePeriods')}
                          graphConfig={this.getConfig('graphs.config')}
                          variableConfig={this.getConfig('variables')}
                          unitsConversions={this.getConfig('units')}
                        />
                      </Col>
                    </Row>
                  </React.Fragment>
                }
              </Tab>

              <Tab
                eventKey={'notes'}
                title={<T as='string' path='notes.tab'/>}
                disabled={this.getConfig('notes.disabled')}
                className='pt-2'
              >
                <T path='notes.content'/>
              </Tab>

              <Tab
                eventKey={'references'}
                title={<T as='string' path='references.tab'/>}
                disabled={this.getConfig('references.disabled')}
                className='pt-2'
              >
                <T path='references.content'/>
              </Tab>

              <Tab
                eventKey={'about'}
                title={<T as='string' path='about.tab'/>}
                disabled={this.getConfig('about.disabled')}
                className='pt-2'
              >
                <Tabs id={'about'} defaultActiveKey={'Plan2Adapt'}>
                  {
                    map(
                      tab => (
                        <Tab
                          eventKey={tab.tab}
                          title={tab.tab}
                        >
                          <Cards items={tab.cards}/>
                        </Tab>
                      )
                    )(T.get(
                        texts,
                        'about.tabs',
                        {version: process.env.REACT_APP_VERSION}
                      )
                    )
                  }
                </Tabs>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>
    )
  }
}
