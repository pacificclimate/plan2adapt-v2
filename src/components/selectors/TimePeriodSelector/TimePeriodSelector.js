import PropTypes from 'prop-types';
import React from 'react';
import { SimpleConstraintGroupingSelector } from 'pcic-react-components';
import { middleDecade } from '../../../utils/time-periods';


const getOptionRepresentative = ({ start_date, end_date }) =>
  ({ start_date, end_date });

const getOptionLabel = ({ value: { representative: { start_date, end_date } } }) => {
  const decade = middleDecade({ start_date, end_date });
  return `${decade}s (${start_date}–${end_date})`;
};

export default class TimePeriodSelector extends React.Component {
  static propTypes = {
    bases: PropTypes.array.isRequired,
      // List of basis items the selector will build its options from.

    constraint: PropTypes.object,
      // Any option that does not have a context that matches this value
      // is disabled. Replaces prop getOptionIsDisabled' in `GroupingSelector`.

    value: PropTypes.object,
    onChange: PropTypes.func,
  };

  render() {
    return (
      <SimpleConstraintGroupingSelector
        getOptionRepresentative={getOptionRepresentative}
        getOptionLabel={getOptionLabel}
        {...this.props}
      />
    );
  }
}
