import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import regions from '../../../assets/regions';


export default class RegionSelector extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
  };

  render() {
    return (
      <Select
        isSearchable
        options={regions}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
