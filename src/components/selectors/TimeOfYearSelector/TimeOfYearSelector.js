// Time of Year selector, based on React Select and with value replacement
// TODO: This is a modified copy of the component of the same name from
//   pcic-react-components. This component extends the original backwards
//   compatibly and should be merged back into it.

import React from 'react';
import PropTypes from 'prop-types';
import cond from 'lodash/fp/cond';
import otherwise from 'lodash/fp/stubTrue';
import constant from 'lodash/fp/constant';
import filter from 'lodash/fp/filter';
import find from 'lodash/fp/find';
import flow from 'lodash/fp/flow';
import isNull from 'lodash/fp/isNull';
import isUndefined from 'lodash/fp/isUndefined';
import { SelectWithValueReplacement } from 'pcic-react-components';
import { mapWithKey } from 'pcic-react-components/dist/utils/fp';


// Base data for constructing options
const labels = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
  'Winter—DJF', 'Spring—MAM', 'Summer—JJA', 'Fall—SON', 'Annual'
];


export default class TimeOfYearSelector extends React.Component {
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.any, // Using 'function' logs warnings
    monthly: PropTypes.bool,  // Disable month options
    seasonal: PropTypes.bool, // Disable season options
    yearly: PropTypes.bool,   // Disable annual option
    hideDisabledOptions: PropTypes.bool,  // Hide disabled options
    isInvalidValue: PropTypes.func,  // see SelectWithValueReplacement
    replaceInvalidValue: PropTypes.func,  // see SelectWithValueReplacement
  };

  static defaultProps = {
    monthly: true,
    seasonal: true,
    yearly: true,
    hideDisabledOptions: false,

    // Examines the *current options list* to determine whether the value is
    // invalid (namely, that it matches an option that is disabled).
    // This is slightly tricky, but it comes down to
    // `SelectWithValueReplacement` (like all `withValueReplacement` outputs) being agnostic about the set
    // of possible values, which in this case is a changing (enabled/disabled)
    // list of options.
    isInvalidValue: options =>
      cond([
        [isNull, constant(false)],  // null = no selection
        [isUndefined, constant(true)],  // undefined = 'replace me'
        [otherwise, option => find({ value: option.value })(options).isDisabled]
      ]),

    // Returns the first enabled option in the options list,
    // or null (signifying no selection) if no such option exists.
    replaceInvalidValue: options =>
      () => find({ isDisabled: false })(options) || null,
  };

  render() {
    const {
      value, onChange, monthly, seasonal, yearly, hideDisabledOptions,
      isInvalidValue, replaceInvalidValue,
      ...rest
    } = this.props;
    const options = flow(
      mapWithKey(
        (label, index) => ({
          label,
          value: index,
          isDisabled: (
            (index < 12 && !monthly) ||
            (12 <= index && index < 16 && !seasonal) ||
            (16 <= index && !yearly)
          )
        })
      ),
      filter(option => !(hideDisabledOptions && option.isDisabled)),
    )(labels);

    return <SelectWithValueReplacement
      options={options}
      value={this.props.value}
      onChange={this.props.onChange}
      isInvalidValue={isInvalidValue(options)}
      replaceInvalidValue={replaceInvalidValue(options)}
      {...rest}
    />
  }
}

