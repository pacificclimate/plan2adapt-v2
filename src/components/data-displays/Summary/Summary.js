import PropTypes from 'prop-types';
import React from 'react';
import Table from 'react-bootstrap/Table';
import capitalize from 'lodash/fp/capitalize';
import flow from 'lodash/fp/flow';
import find from 'lodash/fp/find';
import keys from 'lodash/fp/keys';
import map from 'lodash/fp/map';
import zip from 'lodash/fp/zip';
import tap from 'lodash/fp/tap';
import T from '../../../temporary/external-text';
import withAsyncData from '../../../HOCs/withAsyncData';
import { fetchSummaryStatistics } from '../../../data-services/summary-stats';
import isEqual from 'lodash/fp/isEqual';


const format = number => `${number > 0 ? '+' : ''}${number}`;

const unitsSuffix = units =>
  `${units.match(/^[A-Za-z]/) ? ' ' : ''}${units}`;

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


// TODO: Update for backend changes
const displayToDataKey = display => 'data';


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
  const match = s.match(/-?\d\.\d+e[+-]\d+/);
  if (!match) {
    return s;
  }
  return Number.parseFloat(match[0]).toString();
};


const getPeriodPercentileValues = (response, display, period) => {
  // Extract the percentile values from the "data" component of a summary
  // statistics response. This means selecting the correct timescale, then
  // the correct item (identified by centre date) from the timescale component.
  // The correct item needs only to match the centre month. This makes this
  // robust to little calendar and computational quirks that can vary the
  // centre date by a day or two. And it is independent of year.

  // TODO: Remove when backend updated
  if (display === 'relative') {
    return [0, 0, 0];
  }

  const data = response[displayToDataKey(display)]
  const periodItems = data[periodToTimescale(period)];
  return flow(
    keys,
    find(key => key.substring(5, 7) === periodToMonth(period)),
    dataKey => periodItems[dataKey],
  )(periodItems);
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
    const rep = value => expToFixed(value.toPrecision(sigfigs));
    return ({
      variable: {
        label: toVariableLabel(variable),
        units: display === 'absolute' ? data.units : '%',
      },
      seasons: map(season => {
        const seasonData = getPeriodPercentileValues(data, display, season);
        return ({
          label: capitalize(season),
          ensembleMedian: rep(seasonData[1]),
          range: {
            min: rep(seasonData[0]),
            max: rep(seasonData[2]),
          }
        })
      })(seasons)
    })
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
