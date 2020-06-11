import PropTypes from 'prop-types';
import React from 'react';
import { fetchSummaryStatistics } from '../../../data-services/summary-stats';
import isEqual from 'lodash/fp/isEqual';
import withAsyncData from '../../../HOCs/withAsyncData';
import curry from 'lodash/fp/curry';
import map from 'lodash/fp/map';
import every from 'lodash/fp/every';
import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
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
import BarChart from '../BarChart';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { SelectWithValueReplacement as Select } from 'pcic-react-components';
import { allDefined } from '../../../utils/lodash-fp-extras';
import Loader from 'react-loader';


const percentiles = [10, 25, 50, 75, 90];


const labelValueOptions = map(n => ({ label: n, value: n }));

const interpolationIntervalSelectorOptions = labelValueOptions([
  1, 2, 3, 4, 5, 10
]);

const barChartWidthOptions = labelValueOptions([
  0.05, 0.075, 0.1,
]);

const pointRadiusOptions = labelValueOptions([
  4, 4.5, 5, 6, 8, 10,
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
    // This prop receives the data-fetch responses the backend according
    // props region, season, variable, and futureTimePeriods. (`withAsyncData`
    // injects this data.)
    // The layout of this data is:
    //
    //  [
    //    {
    //      status: 'fulfilled',
    //      value: {
    //        percentiles: [ ... ],
    //        units: '...',
    //    },
    //    // OR
    //    {
    //      status: 'rejected',
    //      reason: {
    //        error: ...
    //        parameters: ...
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

  // TODO: Replace state and state management code with settings from config
  //  when values for these parameters are settled.
  state = {
    interpolationInterval: interpolationIntervalSelectorOptions[0],
    barChartWidth: barChartWidthOptions[1],
    pointRadius: pointRadiusOptions[2],
  };

  handleChangeInterpolationInterval =
    interpolationInterval => this.setState({ interpolationInterval });

  handleChangeBarChartWidth =
    barChartWidth => this.setState({ barChartWidth });

  handleChangePointRadius =
    pointRadius => this.setState({ pointRadius });

  render() {
    if (!allDefined(
      [
        'region.geometry',
        'season',
        'variable.representative',
        'historicalTimePeriod.start_date',
        'historicalTimePeriod.end_date',
        'futureTimePeriods[0].start_date',
        'futureTimePeriods[0].end_date',
        'statistics',
        'graphConfig',
        'variableConfig',
        'unitsConversions',
      ],
      this.props
    )) {
      console.log('### COTG: unsettled props', this.props)
      return <Loader/>
    }
    const {
      variable,
      historicalTimePeriod, futureTimePeriods, statistics,
      variableConfig, unitsConversions,
    } = this.props;
    console.log('### COTG.render: statistics', statistics)

    // The data-fetcher always returns a fulfilled promise, but with an array of
    // results that indicate whether each sub-request promise was fulfilled or
    // rejected. We must therefore handle the case that one or more was
    // rejected.
    // In this case we return a detailed error indicator within the app. This is
    // probably not useful to the user. Instead perhaps we should be cagier and
    // print such detailed error info to the console instead.
    if (!every({ status: 'fulfilled' })(statistics)) {
      return (
        <React.Fragment>
          <p>Could not retrieve data for the following time periods:</p>
          <ul>
            {
              flow(
                filter(s => s.status !== 'fulfilled'),
                map(s => (
                  <li>
                    {s.reason.parameters.futureTimePeriod.start_date}{' - '}
                    {s.reason.parameters.futureTimePeriod.end_date}{': '}
                    {s.reason.error.toString()}
                  </li>)
                )
              )(statistics)
            }
          </ul>
        </React.Fragment>
      );
    }

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
    const dataUnits = statistics[0].value.units;
    const convertData = convertUnits(dataUnits, displayUnits);
    const percentileValuesByTimePeriod = flow(
      map(stat => stat.value.percentiles),
      map(map(convertData)),
    )(statistics);

    const variableInfo = getVariableInfo(variableConfig, variableId, display);

    return (
      <React.Fragment>
        <Row>
          <Col lg={6}>
            <p>
              Shows primary data percentile values as line graphs.
            </p>
            <p>
              Shows 10th - 25th, 25th - 50th, 50th - 75th, and 75th - 90th
              intervals as a stacked bar chart.
              These intervals are interpolated temporally between each primary
              data point.
              Bars are coloured darker grey nearer
              the median and lighter gray further from it.
              The stacked bars
              serve as fill between the primary data lines, and as error bars
              around the median line. This is a matter of interpretation or
              explanation, not data.
            </p>
          </Col>
          <Col lg={6}>
            <p>
              The appearance of the graph is affected by 3 parameters.
              You can experiment with different combinations.
              The default is the combination currently thought to be
              most visually effective and pleasing.
            </p>
            <Row>
            <Col lg={4}>
              Interpolation interval (yr)
              <Select
                options={interpolationIntervalSelectorOptions}
                value={this.state.interpolationInterval}
                onChange={this.handleChangeInterpolationInterval}
              />
            </Col>
            <Col lg={4}>
              Bar width
              <Select
                options={barChartWidthOptions}
                value={this.state.barChartWidth}
                onChange={this.handleChangeBarChartWidth}
              />
            </Col>
            <Col lg={4}>
              Data point radius
              <Select
                options={pointRadiusOptions}
                value={this.state.pointRadius}
                onChange={this.handleChangePointRadius}
              />
            </Col>
            </Row>
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
  console.log('COT: convertToDisplayData', variableId, season, data)
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
    // Note use of Promise.allSettled, which always returns a fulfilled promise,
    // containing an array of values indicating fulfillment or rejection of
    // each subpromise. We convert raw fetch rejections to a more informative
    // rejected promise.
    return Promise.allSettled(
      map(
        futureTimePeriod => {
          return fetchSummaryStatistics(
            region, futureTimePeriod, variableId, percentiles
          )
          .then(convertToDisplayData(variableId, season))
          .catch(error =>
            Promise.reject({
              error,
              parameters: { region, futureTimePeriod, variable, percentiles }
            })
          )
        }
      )(futureTimePeriods)
    );
  }
;


export const shouldLoadSummaryStatistics = (prevProps, props) =>
  // ... relevant props have settled to defined values
  allDefined(
    [
      'region.geometry',
      'season',
      'variable.representative',
      'historicalTimePeriod.start_date',
      'historicalTimePeriod.end_date',
      'futureTimePeriods[0].start_date',
      'futureTimePeriods[0].end_date',
    ],
    props
  ) &&
  // ... and there are either no previous props, or there is a difference
  // between previous and current relevant props
  !(
    prevProps &&
    isEqual(prevProps.region, props.region) &&
    isEqual(prevProps.variable, props.variable) &&
    isEqual(prevProps.season, props.season) &&
    isEqual(prevProps.historicalTimePeriod, props.historicalTimePeriod) &&
    isEqual(prevProps.futureTimePeriods, props.futureTimePeriods)
  );


// Wrap the display component with data injection.
const ChangeOverTimeGraph = withAsyncData(
  loadSummaryStatistics, shouldLoadSummaryStatistics, 'statistics'
)(ChangeOverTimeGraphDisplay);


export default ChangeOverTimeGraph;
