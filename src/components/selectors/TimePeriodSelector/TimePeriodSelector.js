import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import timePeriods from '../../../assets/time-periods';


export default class TimePeriodSelector extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
  };

  render() {
    return (
      <Select
        options={timePeriods}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
