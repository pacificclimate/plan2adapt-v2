import PropTypes from 'prop-types';
import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { concatAll } from '../../utils/lodash-fp-extras';
import concat from 'lodash/fp/concat';
import map from 'lodash/fp/map';
import { middleYear } from '../../utils/time-periods';
import zipWith from 'lodash/fp/zipWith';
import {
  displayFormat,
  getVariableInfo
} from '../../utils/variables-and-units';
import merge from 'lodash/fp/merge';
import includes from 'lodash/fp/includes';
import { mapWithKey } from 'pcic-react-components/dist/utils/fp';
import styles from './ChangeOverTimeGraph/ChangeOverTimeGraph.module.css';
import C3Graph from './C3Graph';
import Tab from 'react-bootstrap/Tab';
import { floorMultiple, percentileDatasetName } from './utils';


export default class SimpleLineGraph extends React.Component {
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

  render() {
    const {
      historicalTimePeriod, futureTimePeriods,
      graphConfig, variableInfo,
      percentiles, percentileValuesByTimePeriod,
    } = this.props;

    // Create the data rows for C3.
    const rows = concatAll([
      // Dataset names: The first, 'time' is the x (horizontal) axis.
      // The rest are the names of the various percentile-vs-time curves.
      [concat(['time'], map(percentileDatasetName)(percentiles))],

      // Place a zero for the historical time period "anomaly", which is the
      // first point in each series.
      [concat(middleYear(historicalTimePeriod), map(p => 0)(percentiles))],

      // Now the data from the backend (props.statistics).
      zipWith(
        (ftp, pileValues) => concat(middleYear(ftp), pileValues),
        futureTimePeriods,
        percentileValuesByTimePeriod,
      ),
    ]);
    console.log('### SimpleLineGraph.render: rows', rows)

    const c3options = merge(
      graphConfig.c3optionsSimpleLine,
      {
        data: {
          x: 'time',
          rows,
        },
        axis: {
          y: {
            label: {
              text: `Change in ${variableInfo.label} (${variableInfo.units})`,
            },
          },
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

    return (
      <React.Fragment>
        <p>
          Shows 10th, 25th, 50th, 75th, and 90th percentile values as
          line graphs. No fill between these lines.
        </p>
        <C3Graph
          {...c3options}
        />
      </React.Fragment>
    )
  }
}