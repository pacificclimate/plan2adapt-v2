import PropTypes from 'prop-types';
import React from 'react';
import BCBaseMap from '../BCBaseMap';
import './DataMap.css'


export default class DataMap extends React.Component {
  static propTypes = {
  };

  state = {
  };

  render() {
    return (
      <BCBaseMap {...this.props} />
    );
  }
}
