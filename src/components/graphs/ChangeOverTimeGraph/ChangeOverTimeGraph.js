import PropTypes, { checkPropTypes } from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import C3Graph from '../C3Graph';
import { fetchSummaryStatistics } from '../../../data-services/summary-stats';
import isEqual from 'lodash/fp/isEqual';
import withAsyncData from '../../../HOCs/withAsyncData';
import curry from 'lodash/fp/curry';
import tap from 'lodash/fp/tap';
import map from 'lodash/fp/map';
import zip from 'lodash/fp/zip';
import transpose from 'lodash/fp/zipAll';  // Yes, it functions as transpose
import concat from 'lodash/fp/concat';
import {
  getDisplayData,
  getPeriodData,
  seasonIndexToPeriod
} from '../../../utils/percentile-anomaly';

const datas = [
  {
    columns: [
      ['data1', 30, 200, 100, 400, 150, 250],
      ['data2', 50, 20, 10, 40, 15, 25]
    ]
  },
  {
    columns: [
      ['data1', 400, 150, 250, 30, 200, 100, ],
      ['data2', 40, 15, 25, 50, 20, 10]
    ]
  }
];

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

  state = {
    dataIndex: 0,
  };

  toggle = () => this.setState({ dataIndex: 1-this.state.dataIndex })

  render() {
    const { futureTimePeriods, statistics } = this.props;

    // Transform the statistics data into the form consumed by C3.
    const statsTranspose = transpose(map('percentiles')(statistics));
    const columns = map(
      ([p, values]) => concat([`${p}th`], values)
    )(zip(percentiles, statsTranspose));
    console.log('### ChangeOverTimeGraph.render: columns', columns)

    return (
      <React.Fragment>
        <C3Graph
          data={{
            columns
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
  // Return (a promise for) the summary statistics to be displayed in the
  // Graphs tab.
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
        .then(tap(x => console.log('### stats:', x)))
        .then(convertToDisplayData(variableId, season))
        .then(tap(x => console.log('### stats filtered:', x)))
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
