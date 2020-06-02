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
  interpolateArrayBy,
  percentileDatasetName
} from './utils';
import map from 'lodash/fp/map';
import curry from 'lodash/fp/curry';
import { concatAll } from '../../utils/lodash-fp-extras';
import slice from 'lodash/fp/slice';
import flow from 'lodash/fp/flow';
import { middleYear } from '../../utils/time-periods';
import zipAll from 'lodash/fp/zipAll';
import merge from 'lodash/fp/merge';
import includes from 'lodash/fp/includes';
import join from 'lodash/fp/join';
import reverse from 'lodash/fp/reverse';
import { displayFormat } from '../../utils/variables-and-units';
import { mapWithKey } from 'pcic-react-components/dist/utils/fp';
import styles from './ChangeOverTimeGraph/ChangeOverTimeGraph.module.css';


// zipAll computes the transpose of a 2D matrix.
const transpose = zipAll;

const numInterpolationSelectorOptions =
  map(n => ({ label: n, value: n }))(
    [1, 2, 3, 4, 5, 8, 10, 12, 16, 20]
  );


const barChartWidthOptions =
  map(n => ({ label: n, value: n }))(
    [0.1, 0.2, 0.3, 0.4, 0.5, 0.5, 0.8, 1, 1.2, 1.5, 2.0, 2.5]
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

  state = {
    numInterpolations: numInterpolationSelectorOptions[9],
    barChartWidth: barChartWidthOptions[0],
  };

  handleChangeNInterpolations =
    numInterpolations => this.setState({ numInterpolations });

  handleChangeBarChartWidth =
    barChartWidth => this.setState({ barChartWidth });

  render() {
    const {
      historicalTimePeriod, futureTimePeriods,
      graphConfig, variableInfo,
      percentiles, percentileValuesByTimePeriod,
    } = this.props;

    const percentileIndices = range(0, percentiles.length);

    // You know I could do this in a one-liner, right?
    const allPercentileValues = flattenDeep([0, percentileValuesByTimePeriod]);
    const minPercentileValue = min(allPercentileValues);
    const maxPercentileValue = max(allPercentileValues);

    const offset = ceilMultiple(2, -min([0, minPercentileValue]));
    const addOffset = v => v + offset;
    console.log('### BarChart.render: minPercentileValue, offset', minPercentileValue, offset)
    const yMin = minPercentileValue + offset;
    const yMax = maxPercentileValue + offset;
    console.log('### BarChart.render: yMin, yMax', yMin, yMax)
    const fakeMedianBarValue = (yMax - yMin) / 400;

    const historicalTimePeriodMiddleYear = middleYear(historicalTimePeriod);

    // Interpolate temporally
    const timeInterpolator = interpolateArrayBy(this.state.numInterpolations.value);

    const futureTPMiddleYears = map(middleYear)(futureTimePeriods);
    const timeInterpFutureTPMMiddleYears = timeInterpolator(futureTPMiddleYears);

    const percentileValuesT = transpose(percentileValuesByTimePeriod);
    const timeInterpPercentilesT = map(timeInterpolator)(percentileValuesT);
    const timeInterpPercentilesByTimePeriod = transpose(timeInterpPercentilesT);

    const percentileValueDifferencesByTimePeriodWithOffset = map(
      pileValues => map(
        i => i ? (pileValues[i] - pileValues[i-1]) : (pileValues[i] + offset)
      )(percentileIndices)
    )(timeInterpPercentilesByTimePeriod);
    console.log('### BarChart.render: percentileValueDifferencesByTimePeriodWithOffset', percentileValueDifferencesByTimePeriodWithOffset)

    const injectMedianValue = curry((value, items) =>
      concatAll([slice(0, 3, items), value, slice(3, 5, items)])
    );

    const percentileDifferenceNames = flow(
      map(
        i => `${i ? percentiles[i-1] : 0}-${percentiles[i]}th`
      ),
      // injectMedianValue('median'),
    )(percentileIndices);
    const primaryDatasetNames = map(percentileDatasetName)(percentiles);

    const rows2 = concatAll([
      // Dataset names: The first, 'time' is the x (horizontal) axis.
      // The rest are the names of the various percentile-vs-time curves.
      [concatAll([
        'time',
        percentileDifferenceNames,
        reverse(primaryDatasetNames),
      ])],

      // Zero row for the historical time period "anomaly", which is the
      // first actual point in each series.
      [concatAll([
        historicalTimePeriodMiddleYear,
        // injectMedianValue(0)(map(() => 0)(percentileIndices)),
        map(() => 0)(percentileIndices),
        map(() => offset)(percentileIndices),
      ])],

      flow(
        zipAll,
        map(concatAll),
      )([
        timeInterpFutureTPMMiddleYears,
        percentileValueDifferencesByTimePeriodWithOffset,
        // map(
        //   injectMedianValue(fakeMedianBarValue),
        //   percentileValueDifferencesByTimePeriodWithOffset
        // ),
        flow(
          map(map(addOffset)),
          map(reverse),
        )(timeInterpPercentilesByTimePeriod),

      ]),
    ]);
    console.log('### BarChart.render: rows2', rows2)

    const c3options = merge(
      graphConfig.c3optionsBarChart,
      {
        data: {
          x: 'time',
          rows: rows2,
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
              if (year === historicalTimePeriodMiddleYear) {
                return `${floorMultiple(10, year)}s (baseline)`;
              }
              if (includes(year, futureTPMiddleYears)) {
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
              const year = timeInterpFutureTPMMiddleYears[index-1];
              if (
                includes(id, ['10th', '25th', '50th', '75th', '90th']) &&
                includes(year, futureTPMiddleYears)
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
              Data is interpolated temporally.
              N-1 interpolated time points (with interpolated values) are
              placed between each successive pair of primary data points.
              (Therefore there are a total of 2N + 1 bar stacks.)
              Interpolation factor 1 yields the original bar chart.
            </p>
          </Col>
          <Col lg={3}>
            Temporal interpolation factor
            <Select
              options={numInterpolationSelectorOptions}
              value={this.state.numInterpolations}
              onChange={this.handleChangeNInterpolations}
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
