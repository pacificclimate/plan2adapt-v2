import { fetchRulesResults } from '../../../data-services/rules-engine';
import isEqual from 'lodash/fp/isEqual';

export const loadRulesResults = props => {
  return fetchRulesResults(props.region, props.futureTimePeriod);
};


export const shouldLoadRulesResults = (prevProps, props) =>
  // ... relevant props have settled to defined values
  props.region && props.futureTimePeriod &&
  // ... and there are either no previous props, or there is a difference
  // between previous and current relevant props
  !(
    prevProps &&
    isEqual(prevProps.region, props.region) &&
    isEqual(prevProps.futureTimePeriod, props.futureTimePeriod)
  );


