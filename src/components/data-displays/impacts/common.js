import { fetchRulesResults } from '../../../data-services/rules-engine';
import isEqual from 'lodash/fp/isEqual';
import { allDefined } from '../../../utils/lodash-fp-extras';

export const loadRulesResults = props => {
  return fetchRulesResults(props.region, props.futureTimePeriod);
};


export const shouldLoadRulesResults = (prevProps, props) =>
  // Component is active
  props.active &&
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
    isEqual(prevProps.active, props.active) &&
    isEqual(prevProps.region, props.region) &&
    isEqual(prevProps.futureTimePeriod, props.futureTimePeriod)
  );


