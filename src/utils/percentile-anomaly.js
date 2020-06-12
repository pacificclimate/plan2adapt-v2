// These functions convert the data we retrieve from the backend to the
// format that Summary and ChangeOverTimeGraph consume.

import flow from 'lodash/fp/flow';
import keys from 'lodash/fp/keys';
import find from 'lodash/fp/find';
import isUndefined from 'lodash/fp/isUndefined';
import map from 'lodash/fp/map';
import { nearZero } from './math';


// TODO: Most of the results of these period conversion functions should all
//  be contained in the TimeOfYearSelector values. Which is to say, most or all
//  of the values that are converted should just be stored in each option value.
//  What a mess.

export const seasonIndexToPeriod = index => ([
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  'winter', 'spring', 'summer', 'fall',
  'annual',
])[index];


export const periodToTimescale = period => {
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


export const periodToMonth = period => {
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


export const getPeriodData = (source, period) => {
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
  if (!timescaleItems) {
    throw new Error(
      `No data for timescale '${periodToTimescale(period)}' 
      (period '${period}')`
    );
  }
  return flow(
    keys,
    find(key => key.substring(5, 7) === periodToMonth(period)),
    dataKey => {
      if (!dataKey) {
        throw new Error(
          `No data for period '${period}' (month ${periodToMonth(period)})`
        );
      }
      return timescaleItems[dataKey]
    },
  )(timescaleItems);
};


export const getDisplayData = (response, period, display) => {
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
  // TODO: Get zero tolerance from config
  if (nearZero(baselineValue)) {
    return {
      percentiles: map(() => 0)(anomalyValues),
      units: '%',
    }
  }
  return {
    percentiles: map(x => 100 * x/baselineValue)(anomalyValues),
    units: '%',
  };
};
