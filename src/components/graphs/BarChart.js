import React from 'react';
import PropTypes from 'prop-types';
import C3Chart from './C3Chart';
import fromPairs from 'lodash/fp/fromPairs';
import range from 'lodash/fp/range';
import rangeStep from 'lodash/fp/rangeStep';
import flattenDeep from 'lodash/fp/flattenDeep';
import reverse from 'lodash/fp/reverse';
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
import { displayFormat, baselineFormat } from '../../utils/variables-and-units';
import { mapWithKey } from 'pcic-react-components/dist/utils/fp';
import styles from './ChangeOverTimeGraph/ChangeOverTimeGraph.module.css';


// zipAll computes the transpose of a 2D matrix.
const transpose = zipAll;


export default class BarChart extends React.Component {
  static propTypes = {
    baselineTimePeriod: PropTypes.object.isRequired,
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
    median: PropTypes.object,
    variableConfig: PropTypes.object
  };

  render() {
    const {
      baselineTimePeriod, futureTimePeriods,
      graphConfig, variableInfo,
      percentiles, percentileValuesByTimePeriod,
      median, variableConfig,
    } = this.props;

    const percentileIndices = range(0, percentiles.length);

    const basePercentileValueNames =
      map(p => `${p}th`)(percentiles);

    const interpPercentileValueDiffNames = map(
      i => `${i ? percentiles[i - 1] : 0}-${percentiles[i]}th (interp)`
    )(percentileIndices);

    // In order to display negative values as stacked bars, we have to add
    // an offset to make them all positive, then subtract it when displaying
    // these values in axes, tooltips, etc. The offset is zero if there are
    // no negative values. It is the (negative of) the most negative value
    // otherwise, rounded to a multiple of 2 so that C3's automatic y-axis
    // tick values are nice.
    const precision = variableConfig[variableInfo.id].precision;
    const formatValues = values => values.map(v => parseFloat(displayFormat(precision, v)));
    const formattedPercentileValuesByTimePeriod = percentileValuesByTimePeriod.map(formatValues);
    const allPercentileValues = flattenDeep([0, formattedPercentileValuesByTimePeriod]);

    const minPercentileValue = min(allPercentileValues);
    const maxPercentileValue = max(allPercentileValues);

    const offset = ceilMultiple(2, -min([0, minPercentileValue]));
    const addOffset = v => v + offset;
    const yMin = minPercentileValue + offset;
    const yMax = maxPercentileValue + offset;

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

    const historicalMiddleYear = middleYear(baselineTimePeriod);
    const futureMiddleYears = map(middleYear)(futureTimePeriods);

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

    // Note: "interp" = "interpolated"
    //
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
      linearInterpolator(graphConfig.interpolationInterval, baseTimes);
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

    const interpTimes = flatten(
      // First of repeated interpolated times
      interpTimesAndValuesByPercentile[0][0],
    );

    const interpPercentileValuesByPercentile = flow(
      map(1), // Get interpolated y (percentile) values
      map(flatten),
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
      i => i ? (pileValues[i] - pileValues[i - 1]) : pileValues[i]
    )(percentileIndices);
    const interpPercentileValueDiffsByTime =
      map(diffs)(interpPercentileValuesByTime);
    const interpPercentileValueDiffsByPercentile =
      transpose(interpPercentileValueDiffsByTime);

    const columns = concatAll([
      // Time values for base data
      [concatAll(['baseTime', baseTimes])],

      // Base percentile values
      flow(
        zipAll,
        map(concatAll),
        // Reverse so that they are presented in tooltip in same vertical order
        // as they appear on the graph. Note this is not done to other datasets.
        reverse,
      )([basePercentileValueNames, basePercentileValuesByPercentile]),

      // Time values for interpolated data
      [concatAll(['interpTime', interpTimes])],

      // Interpolated percentile value differences
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
            // Interp data bars use interpTime
            ...fromPairsMulti([[interpPercentileValueDiffNames, 'interpTime']]),
          },
          types: {
            // Base data presented as lines
            ...fromPairsMulti([[basePercentileValueNames, 'line']]),
            // Interp data presented as stacked bar charts of differences
            ...fromPairsMulti([[interpPercentileValueDiffNames, 'bar']]),
          },
          groups: [
            interpPercentileValueDiffNames,
          ],
          colors: {
            // TODO: Obtain colours from config
            ...fromPairs(zipAll([
              basePercentileValueNames,
              ['#cccccc', '#aaaaaa', 'black', '#aaaaaa', '#cccccc']
            ])),
            ...fromPairs(zipAll([
              interpPercentileValueDiffNames,
              ['transparent', '#cccccc', '#aaaaaa', '#aaaaaa', '#cccccc']
            ])),
          },
          columns,
        },
        point: {
          focus: {
            expand: {
              r: graphConfig.c3options.point.focus.expand.factor *
                graphConfig.c3options.point.r,
            },
          },
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
              format: d => `${d - offset}`,
            },
            label: {
              text: `Change in ${variableInfo.label} (${variableInfo.unitsSpec.label})`,
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
        legend: {
          hide: interpPercentileValueDiffNames,
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
              const precision = variableConfig[variableInfo.id].precision
              if (
                index === 0
                && id === basePercentileValueNames[0]
              ) {
                const medianUnit = variableConfig[variableInfo.id].medianUnit
                return `Median Value\n ${baselineFormat(precision, Number.parseFloat(median))} ${medianUnit}`;
              }
              const year = baseTimes[index];
              if (
                includes(id, basePercentileValueNames)
                && includes(year, futureMiddleYears)
              ) {
                const displayValue = displayFormat(precision, value - offset);
                return `${displayValue} ${variableInfo.unitsSpec.id}`;
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
          }))(concatAll([baselineTimePeriod, futureTimePeriods])),
      },

      graphConfig.c3options,
    );
    console.log('### BarChart.render: c3options', c3options)

    return (
      <C3Chart
        {...c3options}
      />
    )
  }
}
