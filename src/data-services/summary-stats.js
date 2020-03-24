import axios from 'axios';
import urljoin from 'url-join';
import { regionId } from '../utils/regions';
import { middleDecade } from '../utils/time-periods';
import fake from '../assets/summary';


export const fetchSummaryStatistics = (
  region, timePeriod, variable, percentiles
) => {
  // Fetch the summary statistics for the given region, climatological time
  // period, variable, percentiles.
  // `region` is a feature object from the regions service
  // `timePeriod` is an object of the form {start_date, end_date}
  // `variable` is a string identifying the variable (e.g., 'tasmean')
  // `percentiles` is an array of percentile values to be computed across
  //    the ensemble
  // Returns a promise for the summary statistics data.

  console.log('### fetchSummaryStatistics', region, timePeriod, variable, percentiles)

  // TODO: Remove fakery when backend available
  if (process.env.REACT_APP_SUMMARY_STATISTICS_URL === 'fake') {
    return new Promise(resolve => {
      setTimeout(() => resolve(fake[variable]), 1000);
    });
  }
  return axios.get(
    urljoin(process.env.REACT_APP_SUMMARY_STATISTICS_URL, 'percentileanomaly'),
    // TODO: Replace with this when certain
    // urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'tbd'),
    {
      params: {
        region: regionId(region),
        climatology: middleDecade(timePeriod),
        variable,
        percentile: percentiles.join(',')
      }
    }
  )
  .then(response => response.data);
};
