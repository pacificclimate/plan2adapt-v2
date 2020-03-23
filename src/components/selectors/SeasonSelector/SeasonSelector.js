// TODO: DRY up selector defaulting; use a common option matcher for all
//  selectors

import PropTypes from 'prop-types';
import React from 'react';
// import { TimeOfYearSelector } from 'pcic-react-components';
import TimeOfYearSelector from '../TimeOfYearSelector';
import curry from 'lodash/fp/curry';
import find from 'lodash/fp/find';


export default class SeasonSelector extends React.Component {
  static propTypes = {
    default: PropTypes.number,
    // Default value; specified by a season value (0 ... 16), indicating
    // months Jan - Dec (0 ... 11);
    // seasons Winter, Spring, Summer, Fall (12 ... 15);
    // annual (16)

    value: PropTypes.object,
    onChange: PropTypes.func,

    replaceInvalidValue: PropTypes.func,
    // Can be overridden, but why would you mess with perfection?
  };

  static defaultProps = {
    // Replaces an invalid value (typically, `undefined`) with the default
    // value specified in this.props.default.
    replaceInvalidValue: curry(
      optValue => options => value =>
        find(option => option.value === optValue)(options)
    ),
  };

  render() {
    const { replaceInvalidValue, 'default': def, ...rest } = this.props;
    return (
      <TimeOfYearSelector
       monthly={false}
       hideDisabledOptions
       replaceInvalidValue={replaceInvalidValue(def)}
       {...rest}
      />
    );
  }
}
