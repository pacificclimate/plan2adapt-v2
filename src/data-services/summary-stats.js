import axios from 'axios';
import mapKeys from 'lodash/fp/mapKeys';
import { regionId } from '../utils/regions';
import { middleDecade } from '../utils/time-periods';
import summary from '../assets/summary';


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
  // Returns

  console.log('### fetchSummaryStatistics', region, timePeriod, variable, percentiles)
  return Promise.resolve(summary[variable]);

  return axios.get(
    process.env.REACT_APP_SUMMARY_STATISTICS_URL,
    {
      params: {
        region: regionId(region),
        climatology: middleDecade(timePeriod),
        variable,
        percentiles: ','.join(percentiles)
      }
    }
  )
  .then(response => response.data);
};
