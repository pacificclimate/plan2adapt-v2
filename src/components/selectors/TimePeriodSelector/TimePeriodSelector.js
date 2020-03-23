// TODO: DRY up selector defaulting; use a common option matcher for all
//  selectors

import PropTypes from 'prop-types';
import React from 'react';
import curry from 'lodash/fp/curry';
import find from 'lodash/fp/find';
import { SimpleConstraintGroupingSelector } from 'pcic-react-components';
import { middleDecade } from '../../../utils/time-periods';


const getOptionRepresentative = ({ start_date, end_date }) =>
  ({ start_date, end_date });

const getOptionLabel = (
  { value: { representative: { start_date, end_date } } }
) => {
  const decade = middleDecade({ start_date, end_date });
  return `${decade}s (${start_date}–${end_date})`;
};

const replaceInvalidValue = curry(
  (decade, options, value) => {
    return find(
      option => middleDecade(option.value.representative) === decade
    )(options);
  }
);

export default class TimePeriodSelector extends React.Component {
  static propTypes = {
    bases: PropTypes.array.isRequired,
      // List of basis items the selector will build its options from.

    constraint: PropTypes.object,
      // Any option that does not have a context that matches this value
      // is disabled. Replaces prop getOptionIsDisabled' in `GroupingSelector`.

    default: PropTypes.number,
    // Default value; specified by numerical decade (e.g., 2020)

    value: PropTypes.object,
    onChange: PropTypes.func,
  };

  render() {
    return (
      <SimpleConstraintGroupingSelector
        getOptionRepresentative={getOptionRepresentative}
        getOptionLabel={getOptionLabel}
        replaceInvalidValue={replaceInvalidValue(this.props.default)}
        {...this.props}
      />
    );
  }
}
