import PropTypes from 'prop-types';
import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import C3Graph from '../C3Graph';
import { fetchSummaryStatistics } from '../../../data-services/summary-stats';
import isEqual from 'lodash/fp/isEqual';
import withAsyncData from '../../../HOCs/withAsyncData';
import curry from 'lodash/fp/curry';
import map from 'lodash/fp/map';
import zipWith from 'lodash/fp/zipWith';
import zipAll from 'lodash/fp/zipAll';
import concat from 'lodash/fp/concat';
import merge from 'lodash/fp/merge';
import range from 'lodash/fp/range';
import min from 'lodash/fp/min';
import max from 'lodash/fp/max';
import flatten from 'lodash/fp/flatten';
import flattenDeep from 'lodash/fp/flattenDeep';
import flow from 'lodash/fp/flow';
import includes from 'lodash/fp/includes';
import fromPairs from 'lodash/fp/fromPairs';
import difference from 'lodash/fp/difference';
import slice from 'lodash/fp/slice';
import {
  getDisplayData,
  seasonIndexToPeriod
} from '../../../utils/percentile-anomaly';
import { middleYear } from '../../../utils/time-periods';
import { concatAll } from '../../../utils/lodash-fp-extras';
import {
  displayFormat,
  getConvertUnits,
  getVariableDisplayUnits,
  getVariableInfo
} from '../../../utils/variables-and-units';
import styles from './ChangeOverTimeGraph.module.css';
import './ChangeOverTimeGraph.css';
import { mapWithKey } from 'pcic-react-components/dist/utils/fp';
import { SelectWithValueReplacement as Select } from 'pcic-react-components';
import {
  interpolateArrayBy,
  floorMultiple,
  ceilMultiple,
} from '../utils';
import SimpleLineGraph from '../SimpleLineGraph';
import PseudoFilledLineGraph from '../PseudoFilledLineGraph';


const barChartWidthOptions =
  map(n => ({ label: n, value: n }))(
    [0.1, 0.2, 0.3, 0.4, 0.5, 0.5, 0.8, 1, 1.2, 1.5, 2.0, 2.5]
  );


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

  state = {
    numInterpolations: { label: 10, value: 10 },
    barChartWidth: { label: 0.1, value: 0.1 },
  };

  handleChangeNInterpolations =
      numInterpolations => this.setState({ numInterpolations });
  handleChangeBarChartWidth =
      barChartWidth => this.setState({ barChartWidth });

  render() {
    const {
      variable,
      historicalTimePeriod, futureTimePeriods, statistics,
      graphConfig, variableConfig, unitsConversions,
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

    // Establish display units for variables, and convert data values to those
    // units.
    // TODO: Robusticate
    const variableId = variable.representative.variable_id;
    const display = graphConfig.variables[variableId].display;
    const displayUnits =
      getVariableDisplayUnits(variableConfig, variableId, display);
    const convertUnits =
      getConvertUnits(unitsConversions, variableConfig, variableId);
    const dataUnits = statistics[0].units;
    const convertData = convertUnits(dataUnits, displayUnits);
    const percentileValuesByTimePeriod = map(
      stat => convertData(stat.percentiles)
    )(statistics);
    const variableInfo = getVariableInfo(variableConfig, variableId, display);


    /////////////////////////////////////////////////////////////////////
    // Alternative: Bar chart, with 50th %ile line.

    const percentileIndices = range(0, percentiles.length);
    const percentile50Index = 2; // TODO: Determine from percentiles

    // You know I could do this in a one-liner, right?
    const allPercentileValues = flattenDeep([0, percentileValuesByTimePeriod]);
    const minPercentileValue = min(allPercentileValues);
    const maxPercentileValue = max(allPercentileValues);

    // const offset = 6;
    const offset = ceilMultiple(2, -min([0, minPercentileValue]));
    const addOffset = v => v + offset;
    console.log('### ChangeOverTimeGraph.render: minPercentileValue, offset', minPercentileValue, offset)
    const yMin = minPercentileValue + offset;
    const yMax = maxPercentileValue + offset;
    console.log('### ChangeOverTimeGraph.render: yMin, yMax', yMin, yMax)
    const fakeMedianBarValue = (yMax - yMin) / 500;

    const percentileValueDifferencesByTimePeriodWithOffset = map(
      pileValues => map(
        i => i ? (pileValues[i] - pileValues[i-1]) : (pileValues[i] + offset)
      )(percentileIndices)
    )(percentileValuesByTimePeriod);
    console.log('### ChangeOverTimeGraph.render: percentileValueDifferencesByTimePeriodWithOffset', percentileValueDifferencesByTimePeriodWithOffset)

    const injectMedianValue = curry((value, items) =>
      concatAll([slice(0, 3, items), value, slice(3, 5, items)])
    );
    const percentileDifferenceNames = flow(
      map(
        i => `${i ? percentiles[i-1] : 0}-${percentiles[i]}th`
      ),
      injectMedianValue('median'),
    )(percentileIndices);

    const rows2 = concatAll([
      // Dataset names: The first, 'time' is the x (horizontal) axis.
      // The rest are the names of the various percentile-vs-time curves.
      [concatAll([
        'time',
        percentileDifferenceNames,
        map(p => `${p}th`)(percentiles),
      ])],

      // Zero row for the historical time period "anomaly", which is the
      // first actual point in each series.
      [concatAll([
        middleYear(historicalTimePeriod),
        injectMedianValue(0, map(() => 0)(percentileIndices)),
        map(() => offset)(percentileIndices),
      ])],

      flow(
        zipAll,
        map(concatAll),
      )([
        map(middleYear)(futureTimePeriods),
        map(
          injectMedianValue(fakeMedianBarValue),
          percentileValueDifferencesByTimePeriodWithOffset
        ),
        map(map(addOffset))(percentileValuesByTimePeriod),
      ]),
    ]);
    console.log('### ChangeOverTimeGraph.render: rows2', rows2)

    const c3optionsBarChart = merge(
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
              text: `Change in ${variableInfo.label} (${displayUnits})`,
            },
          },
        },
        tooltip: {
          format: {
            title: year => `${floorMultiple(10, year)}s`,
            name: name => `${name} %ile`,
            value: (value, ratio, id) => {
              if (includes(id, ['10th', '25th', '50th', '75th', '90th'])) {
                return `${displayFormat(2, value - offset)} ${displayUnits}`;
              }
            },
          },
        },
      }
    );
    console.log('### ChangeOverTimeGraph.render: c3optionsBarChart', c3optionsBarChart)

    /////////////////////////////////////////////////////////////////////
    // Alternative: Bar chart, with time interpolation.

    // Note: zipAll computes the transpose of a 2D matrix.
    const percentileValuesT = zipAll(percentileValuesByTimePeriod);
    const timeInterpolator = interpolateArrayBy(5);
    const timeInterpPercentiles = timeInterpolator(percentileValuesT);

    return (
      <Tabs
        id={'graph-alternatives'}
        defaultActiveKey={'psuedofilled-lines'}
      >
        <Tab
          eventKey={'simple-lines'}
          title={'Simple Lines'}
          className='pt-2'
          mountOnEnter
        >
          <SimpleLineGraph
            historicalTimePeriod={historicalTimePeriod}
            futureTimePeriods={futureTimePeriods}
            graphConfig={graphConfig}
            variableInfo={variableInfo}
            percentiles={percentiles}
            percentileValuesByTimePeriod={percentileValuesByTimePeriod}
          />
        </Tab>

        <Tab
          eventKey={'psuedofilled-lines'}
          title={'Pseudo-filled Lines'}
          className='pt-2'
          mountOnEnter
        >
          <PseudoFilledLineGraph
            historicalTimePeriod={historicalTimePeriod}
            futureTimePeriods={futureTimePeriods}
            graphConfig={graphConfig}
            variableInfo={variableInfo}
            percentiles={percentiles}
            percentileValuesByTimePeriod={percentileValuesByTimePeriod}
          />
        </Tab>

        <Tab
          eventKey={'bar-chart'}
          title={'Bar Chart'}
          className='pt-2'
          mountOnEnter
        >
          <Row>
            <Col lg={6}>
              <p>
                Shows 50th percentile values as a line graph.
              </p>
              <p>
                Shows 10th - 25th, 25th - 50th, 50th - 75th, and 75th - 90th
                intervals as a stacked bar chart.
              </p>
            </Col>
            <Col lg={5}>
              You can select bar widths at right.
            </Col>
            <Col lg={1}>
              <Select
                options={barChartWidthOptions}
                value={this.state.barChartWidth}
                onChange={this.handleChangeBarChartWidth}
              />
            </Col>
          </Row>
          <C3Graph
            id={'projected-change-graph2'}
            {...c3optionsBarChart}
          />
        </Tab>
      </Tabs>
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
