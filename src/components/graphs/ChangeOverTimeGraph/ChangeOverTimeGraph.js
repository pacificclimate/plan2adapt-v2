import PropTypes from 'prop-types';
import React from 'react';
import C3Graph from '../C3Graph';
import { fetchSummaryStatistics } from '../../../data-services/summary-stats';
import isEqual from 'lodash/fp/isEqual';
import withAsyncData from '../../../HOCs/withAsyncData';
import curry from 'lodash/fp/curry';
import map from 'lodash/fp/map';
import zipWith from 'lodash/fp/zipWith';
import concat from 'lodash/fp/concat';
import {
  getDisplayData,
  seasonIndexToPeriod
} from '../../../utils/percentile-anomaly';
import { middleDecade } from '../../../utils/time-periods';
import { concatAll } from '../../../utils/lodash-fp-extras';


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

    historicalTimePeriod: PropTypes.object,
    // The time period of the historical baseline dataset.

    futureTimePeriods: PropTypes.array.isRequired,
    // The future time periods to graph, in temporal order.
    // Layout:
    //  [
    //    { start_date: "2010", end_date: "2039"  },
    //    ...
    //  ]

    statistics: PropTypes.array,
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
  };

  render() {
    const {
      variable,
      historicalTimePeriod, futureTimePeriods, statistics
    } = this.props;

    // Because we receive the main data to be displayed, `props.statistics`
    // in what C3 calls rows, we use the `data.rows` option in C3 to pass the
    // data. Rows data is submitted in the following layout:
    //
    // rows: [
    //   ['name1', 'name2', 'name3'], // names of datasets
    //   [90, 120, 300], // first datum for name1, name2, name3
    //   [40, 160, 240], // second datum for name1, name2, name3
    //   [50, 200, 290], // etc.
    //   ...
    // ]
    //
    // The statistics data is not the whole of what needs to be on the graph.
    // We must add:
    //  - A data column for the time axis
    //  - A data row of zero value anomalies for the historical time period
    //
    // Note: The first element of each data row is the time point
    // of that row. The rest are the data for each curve, at that time point.

    const rows = concatAll([
      // Dataset names: The first, 'time' is the x (horizontal) axis.
      // The rest are the names of the various percentile-vs-time curves.
      [concat(['time'], map(p => `${p}th`)(percentiles))],

      // Place a zero for the historical time period "anomaly", which is the
      // first point in each series.
      [concat(middleDecade(historicalTimePeriod), map(p => 0)(percentiles))],

      // Now the data from the backend (props.statistics).
      zipWith(
        (ftp, pileValues) => concat([middleDecade(ftp)], pileValues),
        futureTimePeriods,
        map('percentiles')(statistics)
      ),
    ]);
    console.log('### ChangeOverTimeGraph.render: rows', rows)

    const units = statistics[0].units;

    return (
      <React.Fragment>
        <C3Graph
          data={{
            x: 'time',
            rows,
          }}
          axis={{
            x: {
              type: 'category',
              label: {
                text: 'Time Period (middle year)',
                position: 'outer-center',
              }
            },
            y: {
              type: 'linear', // 'log' for precip vars?
              label: {
                text: `Change in ${variable.representative.variable_name} (${units})`,
                position: 'outer-middle',
              },
            }
          }}
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
