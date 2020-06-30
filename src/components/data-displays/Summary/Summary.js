// TODO: This module is waaaaayyyy too long. Break it up.

import PropTypes from 'prop-types';
import React from 'react';
import Table from 'react-bootstrap/Table';
import capitalize from 'lodash/fp/capitalize';
import map from 'lodash/fp/map';
import zip from 'lodash/fp/zip';
import isEqual from 'lodash/fp/isEqual';
import isUndefined from 'lodash/fp/isUndefined';
import T from '../../../temporary/external-text';
import { getDisplayData } from '../../../utils/percentile-anomaly';
import {
  displayFormat,
  getConvertUnits,
  getVariableDisplayUnits,
  getVariableInfo,
  unitsSuffix,
} from '../../../utils/variables-and-units';
import withAsyncData from '../../../HOCs/withAsyncData';
import { fetchSummaryStatistics } from '../../../data-services/summary-stats';
import { allDefined } from '../../../utils/lodash-fp-extras';
import Loader from 'react-loader';
import styles from './Summary.module.css';


// Utility function for formatting items for display by Summary.
const isLong = s => s.length > 2;


// Component for displaying the per-season data in a Summary table row.
const SeasonTds = ({ data }) => {
  return [
    <td className="text-center">
      <T path='tabs.summary.table.rows.season' data={data} as='string'/>
    </td>,
    <td>
      <T path='tabs.summary.table.rows.ensembleMedian' data={data} as='string'/>
    </td>,
    <td>
      <T path='tabs.summary.table.rows.range' data={data} as='string'/>
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
    baselineTimePeriod: PropTypes.object,

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
    baselineTimePeriod: {
      start_date: 1961,
      end_date: 1990,
    },
  };

  render() {
    if (!allDefined(
      [
        'region',
        'baselineTimePeriod',
        'futureTimePeriod',
        'tableContents',
        'variableConfig',
        'unitsConversions',
      ],
      this.props
    )) {
      console.log('### Summary: unsettled props', this.props)
      return <Loader/>
    }
    const { variableConfig, unitsConversions } = this.props;
    return (
      <Table striped bordered className={styles.summaryTable}>
        <thead>
        <tr>
          <th rowSpan={2} className='align-middle'>
            <T path='tabs.summary.table.heading.variable'/>
          </th>
          <th rowSpan={2} className='align-middle text-center'>
            <T path='tabs.summary.table.heading.season'/>
          </th>
          <th colSpan={2} className='text-center'>
            <T path='tabs.summary.table.heading.projectedChange'
               data={this.props.baselineTimePeriod}/>
          </th>
        </tr>
        <tr>
          <th>
            <T path='tabs.summary.table.heading.ensembleMedian'/>
          </th>
          <th>
            <T path='tabs.summary.table.heading.range' data={{percentiles}}/>
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
                variable: getVariableInfo(variableConfig, variable, display),
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
                      <T path='tabs.summary.table.rows.variable' data={data}/>
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
  allDefined(
    [
      'region.geometry',
      'futureTimePeriod.start_date',
      'futureTimePeriod.end_date',
      'tableContents',
    ],
    props
  ) &&
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
