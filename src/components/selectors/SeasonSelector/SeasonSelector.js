import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import seasons from '../../../assets/seasons';


export default class SeasonSelector extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
  };

  render() {
    return (
      <Select
        options={seasons}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
