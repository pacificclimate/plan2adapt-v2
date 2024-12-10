import axios from 'axios';
import urljoin from 'url-join';
import mapKeys from 'lodash/fp/mapKeys';
import { regionId } from '../utils/regions';
import { middleDecade } from '../utils/time-periods';


const normalizeRuleNames = mapKeys(key => key.substring(5));
// Remove the prefix 'rule_' from the rule names.


export const fetchRulesResults = (region, timePeriod, baseUrlEnvVar) => {
  // Fetch the results from the rules engine for the given region and
  // climatological time period. At present we are using a q&d backend with
  // precomputed results.
  // `region` is a feature object from the regions service
  // `timePeriod` is an object of the form {start_date, end_date}
  // Returns a dict keyed by normalized rule names.
  const baseUrl = process.env[baseUrlEnvVar];
  return axios.get(
    urljoin(
      baseUrl,
      `${regionId(region)}_${middleDecade(timePeriod)}.json`
    )
  )
    .then(response => response.data)
    .then(normalizeRuleNames);
};
