import React from 'react';
import PropTypes from 'prop-types';
import C3Chart from './C3Chart';
import {
  floorMultiple,
  interpolateArrayBy,
  percentileDatasetName
} from './utils';
import map from 'lodash/fp/map';
import { concatAll } from '../../utils/lodash-fp-extras';
import { middleYear } from '../../utils/time-periods';
import flow from 'lodash/fp/flow';
import zipAll from 'lodash/fp/zipAll';
import merge from 'lodash/fp/merge';
import fromPairs from 'lodash/fp/fromPairs';
import difference from 'lodash/fp/difference';
import includes from 'lodash/fp/includes';
import { displayFormat } from '../../utils/variables-and-units';
import { mapWithKey } from 'pcic-react-components/dist/utils/fp';
import styles from './ChangeOverTimeGraph/ChangeOverTimeGraph.module.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { SelectWithValueReplacement as Select } from 'pcic-react-components';


const numInterpolationSelectorOptions =
  map(n => ({ label: n, value: n }))(
    [3, 4, 5, 10, 20, 40, 60, 80, 100]
  );


export default class PseudoFilledLineGraph extends React.Component {
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
    numInterpolations: numInterpolationSelectorOptions[3],
  };

  handleChangeNInterpolations =
    numInterpolations => this.setState({ numInterpolations });

  render() {
    const {
      historicalTimePeriod, futureTimePeriods,
      graphConfig, variableInfo,
      percentiles, percentileValuesByTimePeriod,
    } = this.props;

    const valueInterpolator = interpolateArrayBy(this.state.numInterpolations.value);
    const valueInterpPercentiles = valueInterpolator(percentiles);
    const valueInterpPercentileValuesByTimePeriod =
      map(valueInterpolator)(percentileValuesByTimePeriod);

    const primaryDatasetNames = map(percentileDatasetName)(percentiles);
    const allDatasetNames = map(percentileDatasetName)(valueInterpPercentiles);

    // Create the data rows for C3.
    const rows3 = concatAll([
      // Dataset names: The first, 'time' is the x (horizontal) axis.
      // The rest are the names of the various percentile-vs-time curves.
      [concatAll([
        'time',
        allDatasetNames
      ])],

      // Place a zero for the historical time period "anomaly", which is the
      // first point in each series.
      [concatAll([
        middleYear(historicalTimePeriod),
        map(p => 0)(valueInterpPercentiles)
      ])],

      // Now the data from the backend (props.statistics).
      flow(
        zipAll,
        map(concatAll),
      )([
        map(middleYear)(futureTimePeriods),
        valueInterpPercentileValuesByTimePeriod,
      ]),
    ]);
    console.log('### PseudoFilledLineGraph.render: rows3', rows3)

    const c3options = merge(
      graphConfig.c3optionsPseudoFilled,
      {
        data: {
          x: 'time',
          rows: rows3,
          colors: flow(
            map(p => {
              const key = percentileDatasetName(p);
              if (p === 50) {
                return [key, 'black']
              }
              if (p < 25 || p > 75) {
                // return [key, '#cccccc'];
                return [key, '#89dd44'];
              }
              // return [key, '#aaaaaa'];
              return [key, '#4493dd'];
            }),
            fromPairs,
          )(valueInterpPercentiles),
        },
        axis: {
          y: {
            label: {
              text: `Change in ${variableInfo.label} (${variableInfo.units})`,
            },
          },
        },
        legend: {
          hide: difference(allDatasetNames, primaryDatasetNames),
        },
        tooltip: {
          format: {
            title: year => `${floorMultiple(10, year)}s`,
            name: name => `${name} %ile`,
            value: (value, ratio, id) => {
              if (includes(id, ['10th', '25th', '50th', '75th', '90th'])) {
                return `${displayFormat(2, value)} ${variableInfo.units}`;
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
          }))(concatAll([historicalTimePeriod, futureTimePeriods]))
      }
    );
    console.log('### PseudoFilledLineGraph.render: c3options', c3options)


    return (
      <React.Fragment>
        <Row>
          <Col lg={6}>
            <p>
              Shows 10th, 25th, 50th, 75th, and 90th percentile values as line
              graphs.
            </p>
            <p>
              As an approximation to filling these primary data lines,
              we (linearly) interpolate a variable number of intermediate graph
              lines.
            </p>
          </Col>
          <Col lg={5}>
            <p>You can experiment with various densities of interpolation
              with the dropdown at right. Bear in mind that the number of lines
              created is equal to 4 * N + 1; so for an interpolation factor
              of 100, 401 lines are being drawn.</p>
          </Col>
          <Col lg={1}>
            <Select
              options={numInterpolationSelectorOptions}
              value={this.state.numInterpolations}
              onChange={this.handleChangeNInterpolations}
            />
          </Col>
        </Row>
        <C3Chart
          {...c3options}
        />
      </React.Fragment>
    )
  }
}
