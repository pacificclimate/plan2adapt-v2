import axios from 'axios';
import urljoin from 'url-join';
import mapKeys from 'lodash/fp/mapKeys';
import { middleDecade } from '../utils/time-periods';


const regionId = region => {
  // Map frontend region specifier to region id used by the backend.
  const name = region.properties.english_na;
  switch (name) {
    case 'British Columbia': return 'bc';
    case 'Mount Waddington': return 'mt_waddington';
    default: return name.toLowerCase().replace(/\W+/g, '_');
  }
};


const timePeriodId = middleDecade;
  // Map frontend time period specifier to the time period id (middle decade)
  // used by the backend.


const normalizeRuleNames = mapKeys(key => key.substring(5));
  // Remove the prefix 'rule_' from the rule names.


export const fetchRulesResults = (region, timePeriod) => {
  // Fetch the results from the rules engine for the given region and
  // climatological time period. At present we are using a q&d backend with
  // precomputed results.
  // `region` is a feature object from the regions service
  // `timePeriod` is an object of the form {start_date, end_date}
  // Returns a dict keyed by normalized rule names.

  return axios.get(
    urljoin(
      process.env.REACT_APP_RULES_ENGINE_URL,
      `${regionId(region)}_${timePeriodId(timePeriod)}.json`
    )
  )
  .then(response => response.data)
  .then(normalizeRuleNames);
};
