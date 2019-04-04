import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import timePeriods from '../../../assets/time-periods';


export default class TimePeriodSelector extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
  };

  static formatOptionLabel = ({ value: { shorthand, start_date, end_date } }) =>
    `${shorthand} (${start_date}-${end_date})`;

  render() {
    return (
      <Select
        options={timePeriods}
        formatOptionLabel={TimePeriodSelector.formatOptionLabel}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
