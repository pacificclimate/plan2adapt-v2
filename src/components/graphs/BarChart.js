import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { SelectWithValueReplacement as Select } from 'pcic-react-components';
import C3Graph from './C3Graph';
import range from 'lodash/fp/range';
import flattenDeep from 'lodash/fp/flattenDeep';
import min from 'lodash/fp/min';
import max from 'lodash/fp/max';
import {
  ceilMultiple,
  floorMultiple,
  linearInterpolator,
  percentileDatasetName,
} from './utils';
import map from 'lodash/fp/map';
import { concatAll } from '../../utils/lodash-fp-extras';
import flow from 'lodash/fp/flow';
import { middleYear } from '../../utils/time-periods';
import zipAll from 'lodash/fp/zipAll';
import merge from 'lodash/fp/merge';
import includes from 'lodash/fp/includes';
import reverse from 'lodash/fp/reverse';
import flatten from 'lodash/fp/flatten';
import { displayFormat } from '../../utils/variables-and-units';
import { mapWithKey } from 'pcic-react-components/dist/utils/fp';
import styles from './ChangeOverTimeGraph/ChangeOverTimeGraph.module.css';


// zipAll computes the transpose of a 2D matrix.
const transpose = zipAll;

const interpolationIntervalSelectorOptions =
  map(n => ({ label: n, value: n }))(
    [1, 2, 3, 4, 5, 10]
  );


const barChartWidthOptions =
  map(n => ({ label: n, value: n }))(
    [0.05, 0.075, 0.1, 0.2, 0.3, 0.4, 0.5, 0.8, 1, 1.2, 1.5, 2.0, 2.5]
  );


export default class BarChart extends React.Component {
  static propTypes = {
    historicalTimePeriod: PropTypes.object.isRequired,
    // The time period of the historical baseline dataset.

    futureTimePeriods: PropTypes.array.isRequired,
    // The future time periods to graph, in temporal order.
    // Layout:
    //  [
    //    { start_date: "2010", end_date: "2039"  },
    //    ...
    //  ]

    graphConfig: PropTypes.object.isRequired,
    // Object mapping variable id to information used to control the appearance
    // of the graph for that variable.

    variableInfo: PropTypes.object,

    percentiles: PropTypes.array,
    percentileValuesByTimePeriod: PropTypes.array,
  };

  // TODO: Move these state values into props, and control from outside.
  state = {
    interpolationInterval: interpolationIntervalSelectorOptions[0],
    barChartWidth: barChartWidthOptions[1],
  };

  handleChangeInterpolationInterval =
    interpolationInterval => this.setState({ interpolationInterval });

  handleChangeBarChartWidth =
    barChartWidth => this.setState({ barChartWidth });

  render() {
    const {
      historicalTimePeriod, futureTimePeriods,
      graphConfig, variableInfo,
      percentiles, percentileValuesByTimePeriod,
    } = this.props;

    const percentileIndices = range(0, percentiles.length);

    const percentileDifferenceNames = flow(
      map(
        i => `${i ? percentiles[i-1] : 0}-${percentiles[i]}th`
      ),
    )(percentileIndices);
    const primaryDatasetNames = map(percentileDatasetName)(percentiles);


    // You know I could do this in a one-liner, right?
    const allPercentileValues = flattenDeep([0, percentileValuesByTimePeriod]);
    const minPercentileValue = min(allPercentileValues);
    const maxPercentileValue = max(allPercentileValues);

    const offset = ceilMultiple(2, -min([0, minPercentileValue]));
    const addOffset = v => v + offset;
    const yMin = minPercentileValue + offset;
    const yMax = maxPercentileValue + offset;

    const historicalMiddleYear = middleYear(historicalTimePeriod);
    const futureMiddleYears = map(middleYear)(futureTimePeriods);

    // Interpolate temporally
    //
    // The goal is easily stated: Linearly interpolate each percentile
    // vs time graph at time points a fixed interval apart (e.g., 1 yr), from
    // the first year (baseline midpoint) to the last (last projected midpoint).
    // Present those interpolated values as both lines and bar charts.
    // The bar charts serve in the place of filled regions between the data
    // lines, and also look quite cool on their own account; there is an
    // intended resemblance here to error bars, which they can legitimately
    // be regarded as.
    //
    // The actual doing of this is a little complicated, basically because
    // each line segment between base data points needs a different
    // interpolation function. This is not at all hard mathematically, but
    // organizing the computations is a bit complicated. Hence all the
    // comments below describing the intermediate computations.

    //  baseTimes: [t0, t1, ... ]
    //    from input data
    const baseTimes = concatAll([
      historicalMiddleYear,
      futureMiddleYears
    ]);

    //  basePercentileValuesByTime: [
    //    [ P0,10; P0,25; P0,50; ... ],  // for t0
    //    [ P1,10; P1,25; P1,50; ... ],  // for t1
    //    ...
    //  ]
    //    from input data
    const basePercentileValuesByTime = concatAll([
      [map(() => 0)(percentileIndices)],  // zero values for historical time
      percentileValuesByTimePeriod,       // data points
    ]);

    //  basePercentileValuesByPercentile: [  // = transpose(basePercentileValuesByTime)
    //    [ P0,10; P1,10; P2,10; ... ],  // for p=10
    //    [ P0,25; P1,25; P2,25; ... ],  // for p=25
    //    ...
    //  ]
    const basePercentileValuesByPercentile =
      transpose(basePercentileValuesByTime);

    //  interpTimes: [
    //    [ t0,0; t0,1; t0,2; ... ], // t0,0 = t0
    //    [ t1,0; t1,1; t1,2; ... ], // t1,0 = t1
    //    ...
    //  ]

    //  interpPercentileValuesByPercentile: [
    //    [                                 // for p=10
    //      [ P0,0,10; P0,1,10; P0,2,10; ... ],  // for t0,0; t0,1; , ...
    //      [ P1,0,10; P1,1,10; P1,2,10; ... ],  // for t1,0; t1,1; , ...
    //      ...
    //    ],
    //    [                                 // for p=25
    //      [ P0,0,25; P0,1,25; P0,2,25; ... ],  // for t0,0; t0,1; , ...
    //      [ P1,0,25; P1,1,25; P1,2,25; ... ],  // for t1,0; t1,1; , ...
    //      ...
    //    ],
    //  ]
    //
    //    Pi,j,p = percentile value at ti,j, percentile p
    //    Pi,j,p = Ii,p(ti,j)
    //      where Ii,p interpolates between Pi,p Pi+1,p
    //    In our particular case, Ii,p is a linear interpolator

    //    flatten second-level (per p value) arrays to get pure time series

    // For each percentile, we want to interpolate the basePercentileValues
    // at all the times.
    const li =
      linearInterpolator(this.state.interpolationInterval.value, baseTimes);
    const interpTimesAndValues = map(li)(basePercentileValuesByPercentile);
    // Each element in `interpTimesAndValues` is a pair
    //    [interpTimes, interpPercentileValues]
    // one pair for each percentile.
    // `interpTimes` are the same for each pair, because it is independent of
    // the last argument.
    // `interpPercentileValues` differs in each because it depends on the last
    // argument.
    // This is slightly inefficient but we will bite that for now.

    const interpTimesDeep = interpTimesAndValues[0][0];
    const interpPercentilesByPercentileDeep = map(1)(interpTimesAndValues);
    const interpTimes = flatten(interpTimesDeep);
    const interpPercentilesByPercentile =
      map(flatten)(interpPercentilesByPercentileDeep);

    //  GOAL:
    // 
    //  interpPercentileValuesByTime: [
    //    [                                   // for t0
    //      P0,0,10; P0,0,25; P0,0,50; ...,   // for t0,0
    //      P0,1,10; P0,1,25; P0,1,50; ...,   // for t0,1
    //      P0,2,10; P0,2,25; P0,2,50; ...,   // for t0,2
    //      ...
    //    ],
    //    [                                   // for t1
    //      P1,0,10; P1,0,25; P1,0,50; ...,   // for t1,0
    //      P1,1,10; P1,1,25; P1,1,50; ...,   // for t1,1
    //      P1,2,10; P1,2,25; P1,2,50; ...,   // for t1,2
    //      ...
    //    ],
    //    ...
    //  ]
    const interpPercentileValuesByTime =
      transpose(interpPercentilesByPercentile);
    const interpPercentileValueDiffsByTimeWithOffset = map(
      pileValues => map(
        i => i ? (pileValues[i] - pileValues[i-1]) : (pileValues[i] + offset)
      )(percentileIndices)
    )(interpPercentileValuesByTime);

    // Form the `rows` component of the C3 options.
    const rows = concatAll([
      // Dataset names: concatenate the various names
      [concatAll([
        'time',
        percentileDifferenceNames,
        reverse(primaryDatasetNames),
      ])],

      // Values: zip together times and values, then concatenate these triples
      // to form a row for each triple
      flow(
        zipAll,
        map(concatAll),
      )([
        interpTimes,
        interpPercentileValueDiffsByTimeWithOffset,
        flow(
          map(map(addOffset)),
          map(reverse),
        )(interpPercentileValuesByTime),
      ])
    ]);

    // Build the full C3 options.
    // TODO: Don't get so much of this from config; instead pass in a few
    //  parameters and compute the rest of them. This is still in dev mode.
    const c3options = merge(
      graphConfig.c3optionsBarChart,
      {
        data: {
          x: 'time',
          rows: rows,
        },
        bar: {
          width: {
            ratio: this.state.barChartWidth.value
          },
        },
        axis: {
          y: {
            min: yMin,
            max: yMax,
            tick: {
              format: d => `${d-offset}`
            },
            label: {
              text: `Change in ${variableInfo.label} (${variableInfo.units})`,
            },
          },
        },
        tooltip: {
          format: {
            title: year => {
              if (year === historicalMiddleYear) {
                return `${floorMultiple(10, year)}s (baseline)`;
              }
              if (includes(year, futureMiddleYears)) {
                return `${floorMultiple(10, year)}s (average projected)`;
              }
              return `${year} (interpolated)`;
            },
            name: (name, ratio, id, index) => {
              if (index === 0) {
                return 'all';
              }
              return `${name} %ile`;
            },
            value: (value, ratio, id, index) => {
              if (index === 0 && id === '10th') {
                return 'no change';
              }
              const year = interpTimes[index];
              if (
                includes(id, ['10th', '25th', '50th', '75th', '90th']) &&
                includes(year, futureMiddleYears)
              ) {
                const displayValue = displayFormat(2, value - offset);
                return `${displayValue} ${variableInfo.units}`;
              }
            },
          },
        },
        regions:
          mapWithKey((tp, index) => ({
            axis: 'x',
            start: Number(tp.start_date),
            end: Number(tp.end_date),
            class: index ? styles.projected : styles.baseline,
          }))(concatAll([historicalTimePeriod, futureTimePeriods])),
      }
    );
    console.log('### BarChart.render: c3options', c3options)

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
          <Col lg={3}>
            Interpolation interval (yr)
            <Select
              options={interpolationIntervalSelectorOptions}
              value={this.state.interpolationInterval}
              onChange={this.handleChangeInterpolationInterval}
            />
          </Col>
          <Col lg={3}>
            Bar width
            <Select
              options={barChartWidthOptions}
              value={this.state.barChartWidth}
              onChange={this.handleChangeBarChartWidth}
            />
          </Col>
        </Row>
        <C3Graph
          {...c3options}
        />
      </React.Fragment>
    )
  }
}
