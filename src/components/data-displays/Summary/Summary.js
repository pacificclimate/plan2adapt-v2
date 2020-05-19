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
import isEqual from 'lodash/fp/isEqual';
import isUndefined from 'lodash/fp/isUndefined';
import T from '../../../temporary/external-text';
import {
  displayFormat,
  getConvertUnits,
  getVariableInfo,
  getVariableDisplayUnits,
  unitsSuffix,
} from '../../../utils/variables-and-units';
import withAsyncData from '../../../HOCs/withAsyncData';
import { fetchSummaryStatistics } from '../../../data-services/summary-stats';


// Utility function for formatting items for display by Summary.
const isLong = s => s.length > 2;


// Component for displaying the per-season data in a Summary table row.
const SeasonTds = ({ data }) => {
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
    // TODO: Convert this to a more explicit PropType when the layout settles.
    // Example value of this prop:
    //
    //  [
    //    {
    //      variable: 'tasmean',
    //      display: 'absolute',
    //      precision: 2
    //      seasons: ['annual']
    //    },
    //    {
    //      variable: 'pr',
    //      display: 'relative',
    //      precision: 2
    //      seasons: ['annual', 'summer', 'winter']
    //    },
    //  ]

    tableContentsWithData: PropTypes.array,
    // Abstract specification of the summary table, with data fetched from the
    // backend.
    //
    // Note: This prop is injected via `withAsyncData`. Users should not be
    // specifying this prop directly, only `tableContents`.
    //
    // TODO: Convert this to a more explicit PropType when the layout settles.
    // Example value:
    //  [
    //    {
    //      variable: 'pr',
    //      display: 'absolute',
    //      precision: 2,
    //      seasons: [
    //        {
    //          name: 'annual',
    //          percentiles: [2, 6, 12]
    //        },
    //        {
    //          name: 'summer',
    //          percentiles: [-1, 8, 6]
    //        },
    //        ...
    //      ]
    //    },
    //    ...
    //  ]

    variableConfig: PropTypes.object,
    // Object mapping (scientific) variable names (e.g., 'tasmean') to
    // information used to process and display the variables. Typically this
    // object will be retrieved from a configuration file, but that is not the
    // job of this component.
    //
    // Example value: See configuration file, key 'variables'.
    // TODO: Convert this to a more explicit PropType when the layout settles.

    unitsConversions: PropTypes.object,
    // Object containing units conversions information.Typically this
    // object will be retrieved from a configuration file, but that is not the
    // job of this component.
    //
    // Example value: See configuration file, key 'units'.
    // TODO: Convert this to a more explicit PropType when the layout settles.
  };

  static defaultProps = {
    baseline: {
      start_date: 1961,
      end_date: 1990,
    },
  };

  render() {
    const { variableConfig, unitsConversions } = this.props;
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
            <T path='summary.table.heading.range' data={{percentiles}} as='string'/>
          </th>
        </tr>
        </thead>
        <tbody>
        {
          map(row => {
            // TODO: Extract as component
            const { variable, display, precision } = row;
            const displayUnits =
              getVariableDisplayUnits(variableConfig, variable, display);
            const convertUnits =
              getConvertUnits(unitsConversions, variableConfig, variable);
            const variableInfo =
              getVariableInfo(variableConfig, variable, display);
            return map(season => {
              // Const `data` is provided as context data to the external text.
              // The external text implements the structure and formatting of
              // this data for display. Slightly tricky, very flexible.
              // In addition to the data items it might want (e.g.,
              // `variable.label`, we also include utility functions (e.g.,
              // `format`).
              const convertData = convertUnits(season.units, displayUnits);
              const percentiles = map(convertData)(season.percentiles);
              const data = {
                variable: variableInfo,
                season: {
                  ...season,
                  label: capitalize(season.id),
                  percentiles,
                },
                format: displayFormat(precision),
                isLong,
                unitsSuffix,
              };
              return (
                <tr>
                  {
                    season === row.seasons[0] &&
                    <td
                      rowSpan={row.seasons.length}
                      className='align-middle'
                    >
                      <T path='summary.table.rows.variable'
                        data={data}
                        as='string'
                      />
                    </td>
                  }
                  <SeasonTds data={data}/>
                </tr>
              )
            })(row.seasons);
          })(this.props.tableContentsWithData)
        }
        </tbody>
      </Table>
    );
  }
}


// These functions convert the data we retrieve from the backend to the
// format that Summary consumes. Essentially, it merges the data with the
// table specification. Component Summary is responsible for displaying this
// in the appropriate layout and formatting.

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
    'djf': '01',
    'spring': '04',
    'mam': '04',
    'summer': '07',
    'jja': '07',
    'fall': '10',
    'son': '10',
    'jan': '01',
    'feb': '02',
    'mar': '03',
    'apr': '04',
    'may': '05',
    'jun': '06',
    'jul': '07',
    'aug': '08',
    'sep': '09',
    'oct': '10',
    'nov': '11',
    'dec': '12',
  }[period];
};


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
  // Return the data, with units, to be displayed from the response,
  // according to the selected period (e.g., 'spring') and display type
  // ('absolute' or 'relative'). Object returned is of the form:
  //  {
  //    percentiles: [ ... ],
  //    units: '...',
  //  }

  if (isUndefined(response)) {
    // TODO: Probably better to return just undefined here.
    return {
      // Empty array -> undefined when subscripted; possibly better to return undefined
      percentiles: [],
      units: '??',
    };
  }

  const anomalyValues = getPeriodData(response.anomaly, period);
  if (display === 'absolute') {
    return {
      percentiles: anomalyValues,
      units: response.units,
    };
  }

  // display === 'relative':
  const baselineValue = getPeriodData(response.baseline, period);
  return {
    percentiles: map(x => 100 * x/baselineValue)(anomalyValues),
    units: '%',
  };
};


const tableContentsAndDataToSummarySpec =
  // Convert the raw summary statistics data for each `tableContent` item to
  // the objects consumed by Summary via its `summary` prop. See Summary
  // for a spec of these objects.
  // Argument of this function is `tableContents` zipped with the
  // corresponding data fetched from the backend.
  map(([content, data]) => {
    const { variable, precision, display, seasons } = content;
    return {
      variable,
      display,
      precision,
      hasData: !isUndefined(data),
      seasons: map(season => {
        return {
          id: season,
          ...getDisplayData(data, season, display),
        }
      })(seasons),
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
  loadSummaryStatistics, shouldLoadSummaryStatistics, 'tableContentsWithData'
)(Summary);
