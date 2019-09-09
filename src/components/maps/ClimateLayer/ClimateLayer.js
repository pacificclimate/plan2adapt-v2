import PropTypes from 'prop-types';
import React from 'react';
import { WMSTileLayer } from 'react-leaflet';
import { wmsTileLayerProps } from '../map-utils';


export default class ClimateLayer extends React.Component {
  static propTypes = {
  };

  render() {
    return (
      <WMSTileLayer
        url={process.env.REACT_APP_NCWMS_URL}
        {...wmsTileLayerProps(this.props)}
      />
    );
  }
}
