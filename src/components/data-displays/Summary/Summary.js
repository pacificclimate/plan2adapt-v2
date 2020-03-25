// TODO: This module is waaaaayyyy too long. Break it up.

import PropTypes from 'prop-types';
import React from 'react';
import Table from 'react-bootstrap/Table';
import capitalize from 'lodash/fp/capitalize';
import flow from 'lodash/fp/flow';
import find from 'lodash/fp/find';
import keys from 'lodash/fp/keys';
import map from 'lodash/fp/map';
import zip from 'lodash/fp/zip';
import isUndefined from 'lodash/fp/isUndefined';
import T from '../../../temporary/external-text';
import withAsyncData from '../../../HOCs/withAsyncData';
import { fetchSummaryStatistics } from '../../../data-services/summary-stats';
import isEqual from 'lodash/fp/isEqual';


const format = number => `${number > 0 ? '+' : ''}${number}`;

const unitsSuffix = units =>
  `${units.match(/^[%]/) ? '' : ' '}${units}`;

const isLong = s => s.length > 2;

const SeasonTds = ({ variable, season }) => {
  const units = unitsSuffix(variable.units);
  const data = {variable, season, units, format, isLong};
  return [
    <td className="text-center">
      <T path='summary.table.rows.season' data={data} as='string'/>
    </td>,
    <td>
      <T path='summary.table.rows.ensembleMedian' data={data} as='string'/>
    </td>,
    <td>
      <T path='summary.table.rows.range' data={data} as='string'/>
    </td>,
  ];
};


// These are the percentiles used to establish the range (min, max) and median
// shown in the Summary table. Note that order is important; it is assumed in
// the data-handling code that the order is [min, median, max].
// TODO: Use these values in the table headings/labels.
// TODO: Make these prop(s) of Summary?
const percentiles = [10, 50, 90];


class Summary extends React.Component {
  // This is a pure (state-free), controlled component that renders the entire
  // content of Summary.
  //
  // This component is wrapped with `withAsyncData` to inject the summary
  // statistics that are fetched asynchronously, according to the
  // selected region and climatological time period.

  static propTypes = {
    region: PropTypes.object.isRequired,
    futureTimePeriod: PropTypes.object.isRequired,
    baseline: PropTypes.object,

    tableContents: PropTypes.array.isRequired,
    // Abstract specification of the summary table. Data is implicit in the
    // variable and season specifications, and is fetched by the data loader
    // to construct the concrete table specification. Rows are specified
    // in order of display, "depth first" by variable then seasons.
    //
    // Example value of this prop:
    //
    // [
    //   { variable: 'tasmean', seasons: ['annual'] },
    //   { variable: 'pr', seasons: ['annual', 'summer', 'winter'] },
    // ]

    summary: PropTypes.array,
    // Concrete specification of the summary table, explicitly including data
    // fetched from the backend and some labelling. This is a holdover from
    // an earlier, highly convenient format used when there was no backend
    // API at all. It has however proved a good design to separate the abstract
    // spec (`tableContents`) from the concrete one. It is not a perfect way
    // to handle this (see TO-DO below), but it is quite usable.
    //
    // Table rows are specified in order of display, "depth first" by
    // variable then seasons.
    //
    // Note: This prop is injected via `withAsyncData`. Users should not be
    // specifying this prop directly, only `tableContents`.
    //
    // The data loader is (at present) responsible for making the transformation
    // from backend data to these row specifiers, using the value of
    // `tableContents` to direct it.
    //
    // Example value of this prop:
    //
    // [
    //   {
    //     variable: {
    //       label: 'Precipitation',
    //       units: '%',
    //     },
    //     seasons: [
    //       {
    //         label: 'Annual',
    //         ensembleMedian: 6,
    //         range: { min: 2, max: 12, },
    //       },
    //       {
    //         label: 'Summer',
    //         ensembleMedian: -1,
    //         range: { min: -8, max: 6, },
    //       },
    //       {
    //         label: 'Winter',
    //         ensembleMedian: 8,
    //         range: { min: -2, max: 15, },
    //       },
    //       ...
    //     ]
    //   },
    //   ...
    // ]

  };

  static defaultProps = {
    baseline: {
      start_date: 1961,
      end_date: 1990,
    },
  };

  render() {
    return (
      <Table striped bordered>
        <thead>
        <tr>
          <th rowSpan={2} className='align-middle'>
            <T path='summary.table.heading.variable' as='string'/>
          </th>
          <th rowSpan={2} className='align-middle text-center'>
            <T path='summary.table.heading.season' as='string'/>
          </th>
          <th colSpan={2} className='text-center'>
            <T path='summary.table.heading.projectedChange'
               data={this.props.baseline} as='string'/>
          </th>
        </tr>
        <tr>
          <th>
            <T path='summary.table.heading.ensembleMedian' as='string'/>
          </th>
          <th>
            <T path='summary.table.heading.range' as='string'/>
          </th>
        </tr>
        </thead>
        <tbody>
        {
          map(item =>
            map(season => (
                <tr>
                  {
                    season === item.seasons[0] &&
                    <td
                      rowSpan={item.seasons.length}
                      className='align-middle'
                    >
                      <T path='summary.table.rows.variable'
                        data={item} as='string'
                      />
                    </td>
                  }
                  <SeasonTds variable={item.variable} season={season}/>
                </tr>
              )
            )(item.seasons)
          )(this.props.summary)
        }
        </tbody>
      </Table>
    );
  }
}


// These functions convert the data we retrieve from the backend to the
// format that Summary consumes. It's a bit tedious, but Summary already
// works with hardcoded data in this format, and something very like this
// would have to be done in any case. Let's reduce to an already solved problem!

// TODO: This idea turned out to have strengths. It would be even better to
//  eliminate `toVariableLabel` by placing this information in the
//  `summary.table.contents` data structure. This will likely include a somewhat
//  more general refactoring of what external text content drives Summary.


// There's a better way to do this with the Variable selector options, but
// this is easy to implement and works.
const toVariableLabel = variable => ({
  'tasmean': 'Mean Temperature',
  'pr': 'Precipitation',
  'prsn': 'Snowfall',
  'gdd': 'Growing Degree Days',
  'hdd': 'Heating Degree Days',
  'ffd': 'Frost-Free Days',
}[variable]);


const periodToTimescale = period => {
  // Return the timescale (subannual period category) corresponding to the named
  // subannual period.
  switch (period) {
    case 'annual':
      return 'yearly';
    case 'spring':
    case 'summer':
    case 'fall':
    case 'winter':
      return 'seasonal';
    default:
      return 'monthly';
  }
};


const periodToMonth = period => {
  // Return the 2-character month number that matches the center month of
  // any given subannual period.
  return {
    'yearly': '07',
    'annual': '07',
    'winter': '01',
    'spring': '04',
    'summer': '07',
    'fall': '10',
    // We don't need months ... famous last words.
  }[period];
};


const expToFixed = s => {
  // Convert a string representing a number in exponential notation to a string
  // in (nominally) fixed point notation. Why? Because `Number.toPrecision()`
  // returns exponential notation frequently when we do not want it to. So
  // we apply this.
  const match = s.match(/-?\d\.\d+e[+-]\d+/);
  if (!match) {
    return s;
  }
  return Number.parseFloat(match[0]).toString();
};


const displayFormat = (value, sigfigs = 3) =>
  // Convert a number value to a string in the display format we prefer.
  expToFixed(value.toPrecision(sigfigs));


const getPeriodData = (source, period) => {
  // Extract the specific data item selected by `period` from `source`.
  //
  // `source` is either the "baseline" or "anomaly" component of a response
  // from the `/percentileanomaly` backend.
  //
  // `period` is one of the period indicator strings, e.g., 'annual', 'winter',
  // 'spring', ... 'jan', 'feb', ...
  //
  // `source` is keyed first by timescale (e.g., 'seasonal') and
  // then within timescale by a timestamp centered on the period (e.g.,
  // "2055-04-16 00:00:00" for period == 'spring'.
  // The item is matched only to the centre *month* of the period.
  // Therefore this function is robust to little calendar and computational
  // quirks that can vary the centre date by a day or two. It is independent of
  // year.
  const timescaleItems = source[periodToTimescale(period)];
  return flow(
    keys,
    find(key => key.substring(5, 7) === periodToMonth(period)),
    dataKey => timescaleItems[dataKey],
  )(timescaleItems);
};


const getDisplayData = (response, period, display) => {
  // Return the data to be displayed from the response, according to the
  // selected period (e.g., 'spring') and display type ('absolute' or
  // 'relative').

  if (isUndefined(response)) {
    return [];  // Empty array -> undefined when subscripted; possibly better to return undefined
  }

  const anomalyValues = getPeriodData(response.anomaly, period);
  if (display === 'absolute') {
    return anomalyValues;
  }

  // display === 'relative'
  const baselineValue = getPeriodData(response.baseline, period);
  return map(x => (x - baselineValue)/baselineValue)(anomalyValues);
};


const getUnits = (response, display) => {
  if (isUndefined(response)) {
    return '--';
  }
  if (display === 'relative') {
    return '%';
  }
  return {
      'degC': '°C',
  }[response.units] || response.units;
};


const tableContentsAndDataToSummarySpec =
  // Convert the raw summary statistics data for each `tableContent` item to
  // the objects consumed by Summary via its `summary` prop. See Summary
  // for a spec of these objects.
  // Argument of this function is `tableContents` zipped with the
  // corresponding data fetched from the backend.
  map(([content, data]) => {
    const { variable, precision, display, seasons } = content;
    const sigfigs = precision || 3;
    const rep = value => {
      if (isUndefined(value)) {
        return '(n/a)';
      }
      const displayValue = display === 'absolute' ? value : value * 100;
      return displayFormat(displayValue, sigfigs);
    };
    return {
      variable: {
        label: toVariableLabel(variable),
        units: getUnits(data, display),
      },
      seasons: map(season => {
        const displayData = getDisplayData(data, season, display);
        return {
          label: capitalize(season),
          ensembleMedian: rep(displayData[1]),
          range: {
            min: rep(displayData[0]),
            max: rep(displayData[2]),
          }
        };
      })(seasons)
    };
  });


const loadSummaryStatistics = ({region, futureTimePeriod, tableContents}) =>
  // Return (a promise for) the summary statistics to be displayed in the
  // Summary tab. This amounts to fetching the data for each variable from the
  // backend, then processing it into the form consumed by Summary via its
  // prop `summary`.
  Promise.all(
    map(
      content => fetchSummaryStatistics(
        region, futureTimePeriod, content.variable, percentiles
      )
      // Unavailable or otherwise problematic fetches are returned as undefined.
      // Data display elements are responsible for showing a message.
      .catch(err => {
        console.error('Failed to fetch summary statistics:\n', err);
        return undefined;
      })
    )(tableContents)
  )
  .then(data => tableContentsAndDataToSummarySpec(zip(tableContents, data)));


export const shouldLoadSummaryStatistics = (prevProps, props) =>
  // ... relevant props have settled to defined values
  props.region && props.futureTimePeriod && props.tableContents &&
  // ... and there are either no previous props, or there is a difference
  // between previous and current relevant props
  !(
    prevProps &&
    isEqual(prevProps.region, props.region) &&
    isEqual(prevProps.futureTimePeriod, props.futureTimePeriod) &&
    isEqual(prevProps.tableContents, props.tableContents)
  );


// Wrap the display component with data injection.
export default withAsyncData(
  loadSummaryStatistics, shouldLoadSummaryStatistics, 'summary'
)(Summary);
