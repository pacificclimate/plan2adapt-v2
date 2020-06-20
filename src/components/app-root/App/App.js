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
import isObject from 'lodash/fp/isObject';

import { fetchSummaryMetadata } from '../../../data-services/metadata';

import T from '../../../temporary/external-text';
import AppHeader from '../AppHeader';

import RegionSelector from '../../selectors/RegionSelector/RegionSelector';
import TimePeriodSelector from '../../selectors/TimePeriodSelector';
import SeasonSelector from '../../selectors/SeasonSelector';
import VariableSelector from '../../selectors/VariableSelector';

import Cards from '../../misc/Cards';
import DevColourbar from '../../data-displays/DevColourbar';
import DevGraph from '../../data-displays/DevGraph';
import SummaryTabBody from '../SummaryTabBody';
import ImpactsTabBody from '../ImpactsTabBody';
import MapsTabBody from '../MapsTabBody';
import GraphsTabBody from '../GraphsTabBody';
import { getVariableLabel } from '../../../utils/variables-and-units';
import { setLethargicScrolling } from '../../../utils/leaflet-extensions';

const baselineTimePeriod = {
  start_date: 1961,
  end_date: 1990,
};

export default class App extends Component {
  static contextType = T.contextType;
  getConfig = path => T.get(this.context, path, {}, 'raw');

  state = {
    metadata: null,
    regionOpt: undefined,
    futureTimePeriodOpt: undefined,
    seasonOpt: undefined,
    variableOpt: undefined,
    tabKey: 'graphs',
    context: null,
    contextJustUpdated: null,  // null signals initial state; boolean thereafter
  };

  trackContextState = () => {
    // Context (i.e., this.context) is updated asynchronously. We want to do
    // some actions rarely (really just once), just after context updates to a
    // valid (non-null) value. This function updates state to track that
    // condition, which is signalled by `this.state.contextJustUpdated`.
    // TODO: This seems overcomplicated. Is there a better way?

    if (this.state.contextJustUpdated === null) {
      // Initialization; typically this.context is null, but we can't guarantee
      return this.setState({
        context: this.context,
        contextJustUpdated: isObject(this.context),
      });
    }

    if (isObject(this.context)) {
      // A valid context object ...
      if (this.state.context !== this.context) {
        // ... which just updated
        return this.setState({
          context: this.context,
          contextJustUpdated: true,
        });
      }
      if (this.state.contextJustUpdated) {
        // ... which hasn't updated, but it did the time before
        return this.setState({ contextJustUpdated: false });
      }
    }
  }

  setLethargicScrolling = () => {
    // Lethargic scrolling needs to be set, just once, after context updates.
    // We call this in componentDidMount and componentDidUpdate, and do nothing
    // except the first time context updates. Sigh.

    if (!this.state.contextJustUpdated) {
      return;
    }
    const lethargicScrolling = this.getConfig('maps.lethargicScrolling');
    if (lethargicScrolling && lethargicScrolling.active) {
      setLethargicScrolling(
        lethargicScrolling.stability,
        lethargicScrolling.sensitivity,
        lethargicScrolling.tolerance,
      );
    }
  }

  componentDidMount() {
    // TODO: Inject this using `withAsyncData`
    fetchSummaryMetadata()
      .then(metadata => this.setState({ metadata }));
    // this.setState({ context: this.context });  // ??
    this.trackContextState();
    this.setLethargicScrolling();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.trackContextState();
    this.setLethargicScrolling();
  }

  handleChangeSelection = (name, value) => this.setState({ [name]: value });
  handleChangeRegion = this.handleChangeSelection.bind(this, 'regionOpt');
  handleChangeTimePeriod = this.handleChangeSelection.bind(this, 'futureTimePeriodOpt');
  handleChangeSeason = this.handleChangeSelection.bind(this, 'seasonOpt');
  handleChangeVariable = this.handleChangeSelection.bind(this, 'variableOpt');
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

    const getVariableOptionLabel =
      ({ value: { representative: { variable_id } } }) =>
        getVariableLabel(variableConfig, variable_id);

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
                        value={this.state.regionOpt}
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
                        value={this.state.futureTimePeriodOpt}
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
                        bases={this.state.metadata}
                        value={this.state.variableOpt}
                        default={this.getConfig('selectors.variable.default')}
                        onChange={this.handleChangeVariable}
                        getOptionLabel={getVariableOptionLabel}
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
                          value={this.state.seasonOpt}
                          default={this.getConfig('selectors.season.default')}
                          onChange={this.handleChangeSeason}
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
                  season={get('value', this.state.seasonOpt)}
                  variable={get('value', this.state.variableOpt)}
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
                  <SummaryTabBody
                    regionOpt={this.state.regionOpt}
                    futureTimePeriodOpt={this.state.futureTimePeriodOpt}
                    baselineTimePeriod={baselineTimePeriod}
                  />
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
                  <ImpactsTabBody
                    regionOpt={this.state.regionOpt}
                    futureTimePeriodOpt={this.state.futureTimePeriodOpt}
                    baselineTimePeriod={baselineTimePeriod}
                  />
                }
              </Tab>

              <Tab
                eventKey={'maps'}
                title={<T as='string' path='maps.tab'/>}
                disabled={this.getConfig('maps.disabled')}
                className='pt-2'
                mountOnEnter
              >
                {
                  this.state.tabKey === 'maps' &&
                  <MapsTabBody
                    regionOpt={this.state.regionOpt}
                    futureTimePeriodOpt={this.state.futureTimePeriodOpt}
                    baselineTimePeriod={baselineTimePeriod}
                    seasonOpt={this.state.seasonOpt}
                    variableOpt={this.state.variableOpt}
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
                  <GraphsTabBody
                    regionOpt={this.state.regionOpt}
                    futureTimePeriodOpt={this.state.futureTimePeriodOpt}
                    baselineTimePeriod={baselineTimePeriod}
                    seasonOpt={this.state.seasonOpt}
                    variableOpt={this.state.variableOpt}
                  />
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
