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
import {
  getDisplayData,
  seasonIndexToPeriod
} from '../../../utils/percentile-anomaly';
import {
  getConvertUnits,
  getVariableDisplay
} from '../../../utils/variables-and-units';
import './ChangeOverTimeGraph.css';
import BarChart from '../BarChart';
import { allDefined } from '../../../utils/lodash-fp-extras';
import Loader from 'react-loader';


const percentiles = [10, 25, 50, 75, 90];


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

    baselineTimePeriod: PropTypes.object.isRequired,
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

  render() {
    if (!allDefined(
      [
        'region',
        'season',
        'variable',
        'variableInfo',
        'baselineTimePeriod',
        'futureTimePeriods[0]',
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
      baselineTimePeriod, futureTimePeriods, statistics,
      variableInfo,
      graphConfig, variableConfig, unitsConversions,
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

    // Establish display units for variables, and convert data values to those
    // units.
    const variableId = variableInfo.id;
    const displayUnits = variableInfo.units;
    const convertUnits =
      getConvertUnits(unitsConversions, variableConfig, variableId);
    const dataUnits = statistics[0].value.units;
    const convertData = convertUnits(dataUnits, displayUnits);
    const percentileValuesByTimePeriod = flow(
      map(stat => stat.value.percentiles),
      map(map(convertData)),
    )(statistics);


    return (
      <React.Fragment>
        <BarChart
          baselineTimePeriod={baselineTimePeriod}
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


const convertToDisplayData = curry((graphConfig, variableId, season, data) => {
  const display = getVariableDisplay(graphConfig.variables, variableId);
  return getDisplayData(data, seasonIndexToPeriod(season), display);
});


const loadSummaryStatistics = (
  { region, variable, season, futureTimePeriods, graphConfig }
) =>
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
          .then(convertToDisplayData(graphConfig, variableId, season))
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
      'region',
      'season',
      'variable',
      'baselineTimePeriod',
      'futureTimePeriods[0]',
      'graphConfig',
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
    isEqual(prevProps.baselineTimePeriod, props.baselineTimePeriod) &&
    isEqual(prevProps.futureTimePeriods, props.futureTimePeriods)
  );


// Wrap the display component with data injection.
const ChangeOverTimeGraph = withAsyncData(
  loadSummaryStatistics, shouldLoadSummaryStatistics, 'statistics'
)(ChangeOverTimeGraphDisplay);


export default ChangeOverTimeGraph;
