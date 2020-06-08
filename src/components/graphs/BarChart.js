import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { SelectWithValueReplacement as Select } from 'pcic-react-components';
import C3Graph from './C3Graph';
import fromPairs from 'lodash/fp/fromPairs';
import range from 'lodash/fp/range';
import rangeStep from 'lodash/fp/rangeStep';
import flattenDeep from 'lodash/fp/flattenDeep';
import tail from 'lodash/fp/tail';
import min from 'lodash/fp/min';
import max from 'lodash/fp/max';
import {
  ceilMultiple,
  floorMultiple,
  linearInterpolator,
  percentileDatasetName,
} from './utils';
import map from 'lodash/fp/map';
import { concatAll, fromPairsMulti } from '../../utils/lodash-fp-extras';
import flow from 'lodash/fp/flow';
import { middleYear } from '../../utils/time-periods';
import zipAll from 'lodash/fp/zipAll';
import merge from 'lodash/fp/merge';
import includes from 'lodash/fp/includes';
import flatten from 'lodash/fp/flatten';
import tap from 'lodash/fp/tap';
import { displayFormat } from '../../utils/variables-and-units';
import { mapWithKey } from 'pcic-react-components/dist/utils/fp';
import styles from './ChangeOverTimeGraph/ChangeOverTimeGraph.module.css';


// zipAll computes the transpose of a 2D matrix.
const transpose = zipAll;


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
      historicalTimePeriod, futureTimePeriods,
      graphConfig, variableInfo,
      percentiles, percentileValuesByTimePeriod,
    } = this.props;

    const percentileIndices = range(0, percentiles.length);

    const basePercentileValueDiffNames = map(
      i => `${i ? percentiles[i-1] : 0}-${percentiles[i]}th (base)`
    )(percentileIndices);
    const interpPercentileValueDiffNames = map(
      i => `${i ? percentiles[i-1] : 0}-${percentiles[i]}th (interp)`
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
    //    from input data, WITH OFFSET ADDED
    const basePercentileValuesByTime = flow(
      concatAll,
      map(map(addOffset)),
    )([
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
    const interpTimesAndValuesByPercentile =
      map(li)(basePercentileValuesByPercentile);
    // Each element in `interpTimesAndValues` is a pair
    //    [interpTimes, interpPercentileValues]
    // one pair for each percentile.
    // `interpTimes` are the same for each pair, because it is independent of
    // the last argument.
    // `interpPercentileValues` differs in each because it depends on the last
    // argument.
    // This is slightly inefficient but we will bite that for now.

    // TODO: Remove if we don't actually use this
    // Note: We need to assign colours and other presentation formatting
    // differently for base and interpolated values (that is in fact why
    // the distinction exists). Therefore we remove base time points from
    // interpolated value sets (times and percentile values) so that we do
    // no present base data twice.

    // const removeBasePointAndFlatten = flow(
    //   map(tail),
    //   flatten
    // );
    const removeBasePointAndFlatten = flatten;  // Not removing just now.

    const interpTimes = removeBasePointAndFlatten(
      // First of repeated interpolated times
      interpTimesAndValuesByPercentile[0][0],
    );

    const interpPercentileValuesByPercentile = flow(
      map(1), // Get interpolated y (percentile) values
      map(removeBasePointAndFlatten),
    )(interpTimesAndValuesByPercentile);

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
      transpose(interpPercentileValuesByPercentile);
    const diffs = pileValues => map(
      i => i ? (pileValues[i] - pileValues[i-1]) : pileValues[i]
    )(percentileIndices);
    const interpPercentileValueDiffsByTime =
      map(diffs)(interpPercentileValuesByTime);
    const basePercentileValueDiffsByTime =
      map(diffs)(basePercentileValuesByTime);
    const basePercentileValueDiffsByPercentile =
      transpose(basePercentileValueDiffsByTime);
    const interpPercentileValueDiffsByPercentile =
      transpose(interpPercentileValueDiffsByTime);

    const basePercentileValueNames =
      map(p =>`${p}th (base)`)(percentiles);
    const interpPercentileValueNames =
      map(p =>`${p}th (interp)`)(percentiles);

    const columns = concatAll([
      // Time values for base data
      [concatAll(['baseTime', baseTimes])],

      // Base percentile values
      flow(
        zipAll,
        map(concatAll),
      )([basePercentileValueNames, basePercentileValuesByPercentile]),

      // Time values for interpolated data
      [concatAll(['interpTime', interpTimes])],

      // Temporary: Interpolated percentile values
      flow(
        zipAll,
        map(concatAll),
      )([interpPercentileValueNames, interpPercentileValuesByPercentile]),

      // Base percentile value differences
      // flow(
      //   zipAll,
      //   map(concatAll),
      // )([basePercentileValueDiffNames, basePercentileValueDiffsByPercentile]),

      // TODO: Interp percentile value differences
      flow(
        zipAll,
        map(concatAll),
      )([interpPercentileValueDiffNames, interpPercentileValueDiffsByPercentile]),
    ]);

    // Build the full C3 options.
    const c3options = merge(
      {
        size: {
          // TODO: Compute from size of container?
          height: 600,
        },
        data: {
          order: null,  // Present (stack bars) in order of declaration
          xs: {
            // Base data lines use baseTime
            ...fromPairsMulti([[basePercentileValueNames, 'baseTime']]),
            // Temporary: Interpolated data lines use interpTime
            ...fromPairsMulti([[interpPercentileValueNames, 'interpTime']]),
            // Base data bars use baseTime
            // ...fromPairsMulti([[basePercentileValueDiffNames, 'baseTime']]),
            // Interp data bars use interpTime
            ...fromPairsMulti([[interpPercentileValueDiffNames, 'interpTime']]),
          },
          types: {
            // Base data presented as lines
            ...fromPairsMulti([[basePercentileValueNames, 'line']]),
            // Temporary: Interp data presented as lines
            ...fromPairsMulti([[interpPercentileValueNames, 'line']]),
            // Base data presented as stacked bar charts of differences
            // ...fromPairsMulti([[basePercentileValueDiffNames, 'bar']]),
            // Interp data presented as stacked bar charts of differences
            ...fromPairsMulti([[interpPercentileValueDiffNames, 'bar']]),
          },
          groups: [
            // basePercentileValueDiffNames,
            interpPercentileValueDiffNames,
          ],
          colors: {
            // TODO: Obtain colours from config
            ...fromPairs(zipAll([
              basePercentileValueNames,
              ['#cccccc', '#aaaaaa', 'black', '#aaaaaa', '#cccccc']
            ])),
            ...fromPairsMulti([[interpPercentileValueNames, 'transparent']]),
            ...fromPairs(zipAll([
              basePercentileValueDiffNames,
              ['transparent', '#cccccc', '#aaaaaa', '#aaaaaa', '#cccccc']
            ])),
            ...fromPairs(zipAll([
              interpPercentileValueDiffNames,
              ['transparent', '#cccccc', '#aaaaaa', '#aaaaaa', '#cccccc']
            ])),
          },
          columns,
        },
        bar: {
          width: {
            ratio: this.state.barChartWidth.value
          },
        },
        point: {
          r: this.state.pointRadius.value,
        },
        axis: {
          x: {
            type: 'indexed',
            label: {
              text: 'Year',
              position: 'outer-center',
            },
            min: 1960,
            max: 2100,
            tick: {
              values: rangeStep(10, 1960, 2101)
            },
          },
          y: {
            type: 'linear',
            min: yMin,
            max: yMax,
            tick: {
              format: d => `${d-offset}`,
            },
            label: {
              text: `Change in ${variableInfo.label} (${variableInfo.units})`,
              position: 'outer-middle',
            },
          },
        },
        grid: {
          x: {
            lines: mapWithKey((year, i) => ({
              value: year,
              text: `${floorMultiple(10, year)}s ${i ? '' : '(baseline)'}`,
            }))(baseTimes),
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
      },
      graphConfig.c3optionsBarChart,
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
        <C3Graph
          {...c3options}
        />
      </React.Fragment>
    )
  }
}
