import PropTypes from 'prop-types';
import React from 'react';
import Table from 'react-bootstrap/Table';
import capitalize from 'lodash/fp/capitalize';
import map from 'lodash/fp/map';
import merge from 'lodash/fp/merge';
import zip from 'lodash/fp/zip';
import isEqual from 'lodash/fp/isEqual';
import isString from 'lodash/fp/isString';
import T from '../../../temporary/external-text';
import { getDisplayData } from '../../../utils/percentile-anomaly';
import {
  displayFormat,
  getConvertUnits,
  getVariableInfo,
  unitsSuffix,
  baselineFormat
} from '../../../utils/variables-and-units';
import withAsyncData from '../../../HOCs/withAsyncData';
import { fetchSummaryStatistics, fetchCsvStats } from '../../../data-services/summary-stats';
import { allDefined } from '../../../utils/lodash-fp-extras';
import Loader from 'react-loader';
import styles from './Summary.module.css';


// Utility function for formatting items for display by Summary.
const isLong = s => s.length > 2;


// Component for displaying the per-season data in a Summary table row.
const SeasonTds = ({ data }) => {
  return [
    <td className="text-center">
      <T path='tabs.summary.table.rows.season' data={data} as='string' />
    </td>,
    <td>
      <T path='tabs.summary.table.rows.baselineMedianVal' data={data} as='string' />
    </td>,
    <td>
      <T path='tabs.summary.table.rows.ensembleMedianPerc' data={data} as='string' />
    </td>,
    <td>
      <T path='tabs.summary.table.rows.range' data={data} as='string' />
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
    baselineTimePeriod: PropTypes.object.isRequired,

    tableContents: PropTypes.array.isRequired,
    // Abstract specification of the summary table. Data is implicit in the
    // variable and season specifications, and is fetched by the data loader
    // accordingly. Rows are specified in order of display, "depth first" by
    // variable then seasons.
    //
    // TODO: Convert this to a more explicit PropType when the layout settles.
    // Example value of this prop:
    //
    //  [
    //    {
    //      variable: 'tasmean',
    //      display: 'absolute',
    //      precision: 2
    //      displayUnits: '°C',   // Optional
    //      seasons: ['annual']
    //    },
    //    {
    //      variable: 'pr',
    //      display: 'relative',
    //      precision: 2
    //      seasons: [
    //        {
    //          season: 'annual',
    //          displayUnits: 'mm/year (cum)'
    //        },
    //        {
    //          season: 'summer',
    //          displayUnits: 'mm/season (cum)'
    //        },
    //        {
    //          season: 'winter',
    //          displayUnits: 'mm/season (cum)'
    //        },
    //      ]
    //    },
    //  ]

    summaryStatistics: PropTypes.array,
    // Data fetched from the backend in accordance with prop `tableContents`.
    //
    // Note: This prop is injected via `withAsyncData`. Users should not be
    // specifying this prop directly, only `tableContents`.
    //
    // TODO: Convert this to a more explicit PropType when the layout settles.

    variableConfig: PropTypes.object,
    // Object mapping (scientific) variable names (e.g., 'tasmean') to
    // information used to process and display the variables. Typically this
    // object will be retrieved from a configuration file, but that is not the
    // job of this component.
    //
    // Example value: See configuration file, key 'variables'.
    // TODO: Convert this to a more explicit PropType when the layout settles.

    unitsSpecs: PropTypes.object,
    // Object containing units conversions information.Typically this
    // object will be retrieved from a configuration file, but that is not the
    // job of this component.
    //
    // Example value: See configuration file, key 'units'.
    // TODO: Convert this to a more explicit PropType when the layout settles.
  };

  static defaultProps = {
    baselineTimePeriod: {
      start_date: 1981,
      end_date: 2010,
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
        'unitsSpecs',
      ],
      this.props
    )) {
      console.log('### Summary: unsettled props', this.props)
      return <Loader />
    }

    const { tableContents, summaryStatistics, unitsSpecs } = this.props;
    let isStripe = false;
    let lastVariable = null;
    return (
      <Table bordered className={styles.summaryTable}>
        <thead>
          <tr>
            <th rowSpan={2} className='align-middle'>
              <T path='tabs.summary.table.heading.variable' />
            </th>
            <th rowSpan={2} className='align-middle text-center'>
              <T path='tabs.summary.table.heading.season' />
            </th>
            <th rowSpan={2} className='align-middle text-center'>
              <T path='tabs.summary.table.heading.baselineMedianVal' />
            </th>
            <th colSpan={2} className='text-center'>
              <T path='tabs.summary.table.heading.projectedChange'
                data={this.props.baselineTimePeriod} />
            </th>
          </tr>
          <tr>
            <th>
              <T path='tabs.summary.table.heading.ensembleMedianPerc' />
            </th>
            <th>
              <T path='tabs.summary.table.heading.range' data={{ percentiles }} />
            </th>
          </tr>
        </thead>
        <tbody>
          {
            map(([row, rowSummaryStatistics]) => {
              const { variable, display, precision, seasons } = row;
              return map(season => {
                const seasonSpec = isString(season) ? { season } : season;

                // Create a `variableConfig` that includes display units info
                // from `variableConfig`, and that specified in `row` or
                // `row.season` of `tableContents`.
                const displayUnits = row.displayUnits || seasonSpec.displayUnits;
                const variableConfig = merge(
                  this.props.variableConfig,
                  {
                    [variable]: { displayUnits },
                  }
                );

                // `variableInfo` describes the variable completely. It is built
                // using config info, and includes a full units spec.
                const variableInfo = getVariableInfo(
                  unitsSpecs, variableConfig, variable, display
                );
                // Extract data for this row
                const displayData = getDisplayData(
                  rowSummaryStatistics.summaryStats, seasonSpec.season, display
                );

                // Convert data to display units
                const convertUnits =
                  getConvertUnits(unitsSpecs, variableConfig, variable);
                const convertData =
                  convertUnits(displayData.units, variableInfo.unitsSpec.id);
                const displayPercentileValues =
                  map(convertData)(displayData.values);

                // Retrieve the season median from the seasonMediansMap
                const medians = rowSummaryStatistics.summaryStats.seasonMedians;
                const displayBaselineMedians = baselineFormat(precision, Number.parseFloat([medians[seasonSpec.season]]));

                // Const `data` is provided as context data to the external text.
                // The external text implements the formatting of this data for
                // display. Slightly tricky, very flexible.
                // In addition to the data items it might want (e.g.,
                // `variable.label`, we also include some utility functions (e.g.,
                // `format`).
                const data = {
                  variable: variableInfo,
                  season: {
                    ...seasonSpec,
                    label: capitalize(seasonSpec.season),
                    percentileValues: displayPercentileValues,
                    baselineMedianVal: displayBaselineMedians,
                  },
                  format: displayFormat(precision),
                  isLong,
                  unitsSuffix,
                };


                isStripe = row.variable !== lastVariable ? !isStripe : isStripe;
                lastVariable = row.variable;
                data.baselineMedianVal = Number.parseFloat([data.baselineMedianVal])

                return (
                  <tr className={isStripe ? 'striped-row' : ''} >
                    {
                      season === row.seasons[0] &&
                      <td
                        rowSpan={row.seasons.length}
                        className='align-middle'
                      >
                        <T path='tabs.summary.table.rows.variable' data={data} />
                      </td>
                    }
                    <SeasonTds data={data} />
                  </tr>
                )
              })(seasons);
            })(
              // summaryStatistics items correspond 1:1 with tableContents items
              // TODO: Put into loader?
              zip(tableContents, summaryStatistics)
            )
          }
        </tbody>
      </Table>
    );
  }
}

const loadSummaryStatistics = async ({ region, futureTimePeriod, tableContents }) => {
  // Return (a promise for) the summary statistics to be displayed in the
  // Summary tab. This amounts to fetching the data for each variable from the
  // backend, then processing it into the form consumed by Summary via its
  // prop `summary`.
  const dataFetches = tableContents.map(content =>
    Promise.all([
      fetchSummaryStatistics(region, futureTimePeriod, content.variable, percentiles),
      ...content.seasons.map(season =>
        fetchCsvStats(region, content.variable, season)
          .then(median => ({ season, median }))
          .catch(err => {
            console.error(`Failed to fetch median for ${content.variable} in ${season}:`, err);
            return { season, median: null };  // Return null median on error
          })
      )
    ])
      .then(([summaryStats, ...seasonMedians]) => {
        // Map from season names to median values
        const seasonMediansMap = seasonMedians.reduce((acc, { season, median }) => {
          acc[season] = median;
          return acc;
        }, {});
        summaryStats.seasonMedians = seasonMediansMap;
        return {
          variable: content.variable,
          summaryStats,
        };
      })
  );

  return Promise.all(dataFetches);
};


export const shouldLoadSummaryStatistics = (prevProps, props) =>
  // ... relevant props have settled to defined values
  allDefined(
    [
      'region.geometry',
      'futureTimePeriod.start_date',
      'futureTimePeriod.end_date',
      'baselineTimePeriod.start_date',
      'baselineTimePeriod.end_date',
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
  loadSummaryStatistics, shouldLoadSummaryStatistics, 'summaryStatistics'
)(Summary);
