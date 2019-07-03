import PropTypes from 'prop-types';
import React from 'react';
import { SimpleConstraintGroupingSelector } from 'pcic-react-components';


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

  static getOptionRepresentative = ({ start_date, end_date }) => {
    const decade = Math.floor((Number(start_date) + Number(end_date)) / 20 ) * 10;
    return {
      decade,
      start_date: decade - 10,
      end_date: decade + 20,
    };
  };

  static getOptionLabel = ({ value: { representative: { decade, start_date, end_date } } }) =>
    `${decade}s (${start_date}–${end_date})`;

  render() {
    return (
      <SimpleConstraintGroupingSelector
        getOptionRepresentative={TimePeriodSelector.getOptionRepresentative}
        getOptionLabel={TimePeriodSelector.getOptionLabel}
        {...this.props}
      />
    );
  }
}
