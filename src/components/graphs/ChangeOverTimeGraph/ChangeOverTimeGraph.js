import PropTypes from 'prop-types';
import React from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { fetchSummaryStatistics } from '../../../data-services/summary-stats';
import isEqual from 'lodash/fp/isEqual';
import withAsyncData from '../../../HOCs/withAsyncData';
import curry from 'lodash/fp/curry';
import map from 'lodash/fp/map';
import merge from 'lodash/fp/merge';
import {
  getDisplayData,
  seasonIndexToPeriod
} from '../../../utils/percentile-anomaly';
import {
  getConvertUnits,
  getVariableDisplayUnits,
  getVariableInfo
} from '../../../utils/variables-and-units';
import './ChangeOverTimeGraph.css';
import SimpleLineGraph from '../SimpleLineGraph';
import PseudoFilledLineGraph from '../PseudoFilledLineGraph';
import BarChart from '../BarChart';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { SelectWithValueReplacement as Select } from 'pcic-react-components';


const percentiles = [10, 25, 50, 75, 90];


const labelValueOptions = map(n => ({ label: n, value: n }));

const interpolationIntervalSelectorOptions = labelValueOptions([
  1, 2, 3, 4, 5, 10
]);

const barChartWidthOptions = labelValueOptions([
  0.05, 0.075, 0.1, 0.2, 0.3, 0.4, 0.5, 0.8, 1, 1.2, 1.5, 2.0, 2.5
]);

const pointRadiusOptions = labelValueOptions([
  2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 8, 10,
]);


class ChangeOverTimeGraphDisplay extends React.Component {
  // This is a pure (state-free), controlled component that renders the entire
  // content of ChangeOverTimeGraph.
  //
  // This component is wrapped with `withAsyncData` to inject the
  // statistics that are fetched asynchronously, according to the
  // selected region and climatological time period.

  static propTypes = {
    region: PropTypes.any,
    season: PropTypes.any,
    variable: PropTypes.any,

    historicalTimePeriod: PropTypes.object.isRequired,
    // The time period of the historical baseline dataset.

    futureTimePeriods: PropTypes.array.isRequired,
    // The future time periods to graph, in temporal order.
    // Layout:
    //  [
    //    { start_date: "2010", end_date: "2039"  },
    //    ...
    //  ]

    statistics: PropTypes.array.isRequired,
    // This prop receives the data fetched from the backend according
    // props region, season, variable, and futureTimePeriods. (`withAsyncData`
    // injects this data.)
    // The layout of this data is:
    //
    //  [
    //    {
    //      percentiles: [ ... ],
    //      units: '...',
    //    },
    //    ...
    //  ]
    //
    // There is one item per element of futureTimePeriods, in corresponding
    // order.

    graphConfig: PropTypes.object.isRequired,
    // Object mapping variable id to information used to control the appearance
    // of the graph for that variable.

    variableConfig: PropTypes.object.isRequired,
    // Object mapping (scientific) variable names (e.g., 'tasmean') to
    // information used to process and display the variables. Typically this
    // object will be retrieved from a configuration file, but that is not the
    // job of this component.
    //
    // Example value: See configuration file, key 'variables'.
    // TODO: Convert this to a more explicit PropType when the layout settles.

    unitsConversions: PropTypes.object.isRequired,
    // Object containing units conversions information.Typically this
    // object will be retrieved from a configuration file, but that is not the
    // job of this component.
    //
    // Example value: See configuration file, key 'units'.
    // TODO: Convert this to a more explicit PropType when the layout settles.
  };

  state = {
    interpolationInterval: interpolationIntervalSelectorOptions[0],
    barChartWidth: barChartWidthOptions[1],
    pointRadius: pointRadiusOptions[6],
  };

  handleChangeInterpolationInterval =
    interpolationInterval => this.setState({ interpolationInterval });

  handleChangeBarChartWidth =
    barChartWidth => this.setState({ barChartWidth });

  handleChangePointRadius =
    pointRadius => this.setState({ pointRadius });

  render() {
    const {
      variable,
      historicalTimePeriod, futureTimePeriods, statistics,
      variableConfig, unitsConversions,
    } = this.props;

    // const graphConfig = this.props.graphConfig;
    const graphConfig = merge(
      this.props.graphConfig,

      {
        interpolationInterval: this.state.interpolationInterval.value,
        c3options: {
          bar: {
            width: { ratio: this.state.barChartWidth.value },
          },
          point: {
            r: this.state.pointRadius.value,
          },
        },
      },

    );

    // Establish display units for variables, and convert data values to those
    // units.
    // TODO: Robusticate
    const variableId = variable.representative.variable_id;
    const display = graphConfig.variables[variableId].display;
    const displayUnits =
      getVariableDisplayUnits(variableConfig, variableId, display);
    const convertUnits =
      getConvertUnits(unitsConversions, variableConfig, variableId);
    const dataUnits = statistics[0].units;
    const convertData = convertUnits(dataUnits, displayUnits);
    const percentileValuesByTimePeriod = map(
      stat => convertData(stat.percentiles)
    )(statistics);
    const variableInfo = getVariableInfo(variableConfig, variableId, display);

    return (
      <React.Fragment>
        <Row>
          <Col lg={6}>
            <p>
              Shows 50th percentile values as a line graph.
            </p>
            <p>
              Shows 10th - 25th, 25th - 50th, 50th - 75th, and 75th - 90th
              intervals as a stacked bar chart.
            </p>
            <p>
              Data is interpolated temporally, at equal intervals starting
              from each base data point (historical, projected).
            </p>
          </Col>
          <Col lg={2}>
            Interpolation interval (yr)
            <Select
              options={interpolationIntervalSelectorOptions}
              value={this.state.interpolationInterval}
              onChange={this.handleChangeInterpolationInterval}
            />
          </Col>
          <Col lg={2}>
            Bar width
            <Select
              options={barChartWidthOptions}
              value={this.state.barChartWidth}
              onChange={this.handleChangeBarChartWidth}
            />
          </Col>
          <Col lg={2}>
            Point radius
            <Select
              options={pointRadiusOptions}
              value={this.state.pointRadius}
              onChange={this.handleChangePointRadius}
            />

          </Col>
        </Row>
        <BarChart
          historicalTimePeriod={historicalTimePeriod}
          futureTimePeriods={futureTimePeriods}
          graphConfig={graphConfig}
          variableInfo={variableInfo}
          percentiles={percentiles}
          percentileValuesByTimePeriod={percentileValuesByTimePeriod}
        />
      </React.Fragment>
    );
  }
}


const convertToDisplayData = curry((variableId, season, data) => {
  // TODO: Replace with config
  const display = {
    tasmean: 'absolute',
    pr: 'relative',
    prsn: 'relative',
    gdd: 'absolute',
    hdd: 'absolute',
    ffd: 'absolute',
  }[variableId];
  return getDisplayData(data, seasonIndexToPeriod(season), display);
});


const loadSummaryStatistics = ({region, variable, season, futureTimePeriods}) =>
  // Return (a promise for) the statistics to be displayed in the Graphs tab.
  // These are "summary" statistics, which are stats across the ensemble of
  // models driving this app.
  {
    const variableId = variable.representative.variable_id;
    return Promise.all(
      map(
        futureTimePeriod => fetchSummaryStatistics(
          region, futureTimePeriod, variableId, percentiles
        )
        // Unavailable or otherwise problematic fetches are returned as
        // undefined. Data display elements are responsible for showing a
        // suitable message.
        .catch(err => {
          console.error('Failed to fetch summary statistics:\n', err);
          return undefined;
        })
        .then(convertToDisplayData(variableId, season))
      )(futureTimePeriods)
    );
  }
;


export const shouldLoadSummaryStatistics = (prevProps, props) =>
  // ... relevant props have settled to defined values
  props.region && props.variable && props.season && props.futureTimePeriods &&
  // ... and there are either no previous props, or there is a difference
  // between previous and current relevant props
  !(
    prevProps &&
    isEqual(prevProps.region, props.region) &&
    isEqual(prevProps.variable, props.variable) &&
    isEqual(prevProps.season, props.season) &&
    isEqual(prevProps.futureTimePeriods, props.futureTimePeriods)
  );


// Wrap the display component with data injection.
const ChangeOverTimeGraph = withAsyncData(
  loadSummaryStatistics, shouldLoadSummaryStatistics, 'statistics'
)(ChangeOverTimeGraphDisplay);


export default ChangeOverTimeGraph;
