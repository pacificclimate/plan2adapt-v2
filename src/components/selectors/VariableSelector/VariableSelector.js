import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import variables from '../../../assets/variables';


export default class VariableSelector extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
  };

  render() {
    return (
      <Select
        options={variables}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
