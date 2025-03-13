import React, { Component } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Loader from "../../misc/Loader";

import filter from "lodash/fp/filter";
import map from "lodash/fp/map";
import includes from "lodash/fp/includes";
import isObject from "lodash/fp/isObject";

import { fetchSummaryMetadata } from "../../../data-services/metadata";

import T from "../../../temporary/external-text";
import AppHeader from "../AppHeader";

import RegionSelector from "../../selectors/RegionSelector/RegionSelector";
import TimePeriodSelector from "../../selectors/TimePeriodSelector";
import SeasonSelector from "../../selectors/SeasonSelector";
import VariableSelector from "../../selectors/VariableSelector";

import ErrorBoundary from "../../misc/ErrorBoundary";
import SummaryTabBody from "../SummaryTabBody";
import ImpactsTabBody from "../ImpactsTabBody";
import MapsTabBody from "../MapsTabBody";
import GraphsTabBody from "../GraphsTabBody";
import ReferencesTabBody from "../ReferencesTabBody";
import AboutTabBody from "../AboutTabBody";
import { getVariableLabel } from "../../../utils/variables-and-units";
import { setLethargicMapScrolling } from "../../../utils/leaflet-extensions";
import { getSeasonLabel } from "../../../utils/seasons";

const baselineTimePeriod = {
  start_date: 1981,
  end_date: 2010,
};

export default class App extends Component {
  static contextType = T.contextType;
  getConfig = (path) => T.get(this.context, path, {}, "raw");

  state = {
    metadata: null,
    regionOpt: undefined,
    futureTimePeriodOpt: undefined,
    seasonOpt: undefined,
    variableOpt: undefined,
    tabKey: undefined,
    context: null,
    contextJustUpdated: null, // null signals initial state; boolean thereafter
  };

  trackContextState = (actions) => {
    // Context (i.e., this.context) is updated asynchronously. We want to do
    // some actions rarely (really just once), just after context updates to a
    // valid (non-null) value. This function updates state to track that
    // condition, which is signalled by `this.state.contextJustUpdated`,
    // and invokes each of it actions arguments when it becomes true.
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
        map((action) => action())(actions);
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
  };

  setLethargicMapScrolling = () => {
    const lethargicScrolling = this.getConfig("tabs.maps.lethargicScrolling");
    if (lethargicScrolling && lethargicScrolling.active) {
      setLethargicMapScrolling(
        lethargicScrolling.stability,
        lethargicScrolling.sensitivity,
        lethargicScrolling.tolerance,
      );
    }
  };

  setDefaultTab = () => {
    this.setState({ tabKey: this.getConfig("app.tabs.default") });
  };

  contextStateActions = [this.setLethargicMapScrolling, this.setDefaultTab];

  componentDidMount() {
    // TODO: Inject this using `withAsyncData`
    fetchSummaryMetadata().then((metadata) => this.setState({ metadata }));
    // this.setState({ context: this.context });  // ??
    this.trackContextState(this.contextStateActions);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.trackContextState(this.contextStateActions);
  }

  handleChangeSelection = (name, value) => this.setState({ [name]: value });
  handleChangeRegion = this.handleChangeSelection.bind(this, "regionOpt");
  handleChangeFutureTimePeriod = this.handleChangeSelection.bind(
    this,
    "futureTimePeriodOpt",
  );
  handleChangeSeason = this.handleChangeSelection.bind(this, "seasonOpt");
  handleChangeVariable = this.handleChangeSelection.bind(this, "variableOpt");
  handleChangeTab = this.handleChangeSelection.bind(this, "tabKey");

  selectorEnabled = (name) =>
    includes(this.state.tabKey)(this.getConfig(`selectors.${name}.forTabs`));

  render() {
    // TODO: Extract various parts of this to components to reduce the nesting
    // level. But not until we are pretty sure we have settled this arrangement,
    // since extraction means introducing extra machinery for state-setting
    // callbacks, etc.

    if (!this.context || this.state.metadata === null) {
      console.log("### App: Loading ...");
      return <Loader loading={true} />;
    }
    console.log("### App: Loaded");

    const variableConfig = this.getConfig("variables");
    const getVariableOptionLabel = ({
      value: {
        representative: { variable_id },
      },
    }) => getVariableLabel(variableConfig, variable_id);

    const seasonConfig = this.getConfig("seasons");
    const getSeasonOptionLabel = ({ value: seasonIndex }) =>
      getSeasonLabel(seasonConfig, seasonIndex);

    // This variable drives the construction of the selector list. It is
    // defined inside the component because it needs context and state.
    const selectors = {
      region: (
        <RegionSelector
          default={this.getConfig("selectors.region.default")}
          value={this.state.regionOpt}
          onChange={this.handleChangeRegion}
        />
      ),
      futureTimePeriod: (
        <TimePeriodSelector
          bases={filter((m) => +m.start_date >= 2020)(this.state.metadata)}
          value={this.state.futureTimePeriodOpt}
          default={this.getConfig("selectors.futureTimePeriod.default")}
          onChange={this.handleChangeFutureTimePeriod}
          debug
        />
      ),
      variable: (
        <VariableSelector
          bases={this.state.metadata}
          value={this.state.variableOpt}
          default={this.getConfig("selectors.variable.default")}
          onChange={this.handleChangeVariable}
          getOptionLabel={getVariableOptionLabel}
        />
      ),
      season: (
        <SeasonSelector
          value={this.state.seasonOpt}
          default={this.getConfig("selectors.season.default")}
          onChange={this.handleChangeSeason}
          getOptionLabel={getSeasonOptionLabel}
        />
      ),
    };

    // This variable drives construction of the top-level tabs. It is
    // defined inside the component because it needs context and state.
    // Uses an alternative way to define props that allows for injection
    // of additional (common) props in construction.
    const tabs = {
      summary: {
        key: "summary",
        Component: SummaryTabBody,
        props: {
          regionOpt: this.state.regionOpt,
          futureTimePeriodOpt: this.state.futureTimePeriodOpt,
          baselineTimePeriod: baselineTimePeriod,
        },
      },
      impacts: {
        key: "impacts",
        Component: ImpactsTabBody,
        props: {
          regionOpt: this.state.regionOpt,
          futureTimePeriodOpt: this.state.futureTimePeriodOpt,
          baselineTimePeriod: baselineTimePeriod,
        },
      },
      maps: {
        key: "maps",
        Component: MapsTabBody,
        props: {
          regionOpt: this.state.regionOpt,
          futureTimePeriodOpt: this.state.futureTimePeriodOpt,
          baselineTimePeriod: baselineTimePeriod,
          seasonOpt: this.state.seasonOpt,
          variableOpt: this.state.variableOpt,
          metadata: this.state.metadata,
        },
      },
      graphs: {
        key: "graphs",
        Component: GraphsTabBody,
        props: {
          regionOpt: this.state.regionOpt,
          futureTimePeriodOpt: this.state.futureTimePeriodOpt,
          baselineTimePeriod: baselineTimePeriod,
          seasonOpt: this.state.seasonOpt,
          variableOpt: this.state.variableOpt,
        },
      },
      references: {
        key: "references",
        Component: ReferencesTabBody,
        props: {},
      },
      about: {
        key: "about",
        Component: AboutTabBody,
        props: {},
      },
    };

    return (
      <Container fluid>
        <AppHeader />

        <Row>
          <Col xl={2} lg={12} md={12}>
            <div className="MainSelectors">
              <Row>
                <Col>
                  <T path="selectors.prologue" />
                </Col>
              </Row>

              <Row>
                {map(
                  (key) =>
                    this.selectorEnabled(key) && (
                      <React.Fragment key={key}>
                        <Col xl={12} lg={"auto"} md={"auto"} className="pr-0">
                          {null}
                        </Col>
                        <Col xl={12} lg={"auto"} md={"auto"} className="pr-0">
                          <T
                            path={`selectors.${key}.prefix`}
                            whenError={"null"}
                          />
                        </Col>
                        <Col xl={12} lg={3} md={6}>
                          <ErrorBoundary>{selectors[key]}</ErrorBoundary>
                        </Col>
                        <Col xl={12} lg={"auto"} md={"auto"} className="pr-0">
                          <T
                            path={`selectors.${key}.postfix`}
                            whenError={"null"}
                          />
                        </Col>
                      </React.Fragment>
                    ),
                )(this.getConfig("selectors.ordering"))}
              </Row>
            </div>
          </Col>

          <Col xl={10} lg={12} md={12}>
            <Tabs
              id={"main"}
              activeKey={this.state.tabKey}
              onSelect={this.handleChangeTab}
            >
              {map((key) => {
                const TabBody = tabs[key].Component;
                return (
                  <Tab
                    key={tabs[key].key}
                    eventKey={key}
                    title={<T as="string" path={`tabs.${key}.label`} />}
                    disabled={this.getConfig(`tabs.${key}.disabled`)}
                    className="pt-2"
                    mountOnEnter={true}
                    unmountOnExit={true}
                  >
                    <ErrorBoundary>
                      <TabBody {...tabs[key].props} />
                    </ErrorBoundary>
                  </Tab>
                );
              })(this.getConfig("tabs.ordering"))}
            </Tabs>
          </Col>
        </Row>
      </Container>
    );
  }
}
