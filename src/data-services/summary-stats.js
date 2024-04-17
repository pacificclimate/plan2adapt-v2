import axios from 'axios';
import urljoin from 'url-join';
import { regionId } from '../utils/regions';
import { middleDecade } from '../utils/time-periods';


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
  return axios.get(
    urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'percentileanomaly'),
    {
      params: {
        region: regionId(region),
        climatology: middleDecade(timePeriod),
        variable,
        percentile: percentiles.join(','),
        baseline_model:"PCIC_BLEND_v1",
        baseline_climatology:"8110"
      }
    }
  )
    .then(response => response.data);
};
