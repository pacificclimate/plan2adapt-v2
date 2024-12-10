import { fetchRulesResults } from '../../../data-services/rules-engine';
import isEqual from 'lodash/fp/isEqual';
import { allDefined } from '../../../utils/lodash-fp-extras';

export const loadRulesResults = props => {
  const { region, futureTimePeriod } = props;

  return Promise.all([
    fetchRulesResults(region, futureTimePeriod, 'REACT_APP_RULES_ENGINE_URL'),
    fetchRulesResults(region, futureTimePeriod, 'REACT_APP_CELL_RULES_ENGINE_URL')
  ]).then(([ruleValues, cellRuleValues]) => {
    console.log('Fetched ruleValues:', ruleValues);
    console.log('Fetched cellRuleValues:', cellRuleValues);
    return { ruleValues, cellRuleValues };
  });
};


export const shouldLoadRulesResults = (prevProps, props) =>
  // ... relevant props have settled to defined values
  allDefined(
    [
      'region.geometry',
      'futureTimePeriod.start_date',
      'futureTimePeriod.end_date',
    ],
    props
  ) &&
  // ... and there are either no previous props, or there is a difference
  // between previous and current relevant props
  !(
    prevProps &&
    isEqual(prevProps.region, props.region) &&
    isEqual(prevProps.futureTimePeriod, props.futureTimePeriod)
  );


