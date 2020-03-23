import PropTypes from 'prop-types';
import React from 'react';
import { VariableSelector } from 'pcic-react-components';
import curry from 'lodash/fp/curry';
import find from 'lodash/fp/find';
import flow from 'lodash/fp/flow';
import tap from 'lodash/fp/tap';
import { flattenOptions } from 'pcic-react-components/dist/utils/select';


const replaceInvalidValue = curry(
  (variable_id, options, value) => {
    return flow(
      flattenOptions,
      find(option => option.value.representative.variable_id === variable_id),
    )(options);
  }
);


const getOptionLabel = ({ value: { representative: { variable_name }}}) =>
  `${variable_name}`;


export default class extends React.Component {
  static propTypes = {
    default: PropTypes.string,
    // Default value; specified by a variable id (e.g., 'pr')

    value: PropTypes.object,
    onChange: PropTypes.func,
  };

  render() {
    return (
      <VariableSelector
        replaceInvalidValue={replaceInvalidValue(this.props.default)}
        getOptionLabel={getOptionLabel}
        {...this.props}
      />
    );
  }
}
