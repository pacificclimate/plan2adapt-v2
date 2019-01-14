import PropTypes from 'prop-types';
import React from 'react';
import BCBaseMap from '../BCBaseMap';
import { WMSTileLayer } from 'react-leaflet';
import './DataMap.css'


export default class DataMap extends React.Component {
  static propTypes = {
  };

  state = {
  };

  render() {
    const { viewport, onViewportChange } = this.props;
    const wmsTileLayerProps = {
      format: "image/png",
      logscale: false,
      noWrap: true,
      numcolorbands: 249,
      opacity: 0.7,
      // srs: "EPSG:4326",  // base map overrides, natch
      styles: 'default-scalar/seq-Greens',
      transparent: true,
      version: '1.1.1',

      layers: "pr_aClim_BCCAQv2_CanESM2_historical-rcp85_r1i1p1_19610101-19901231_Canada/pr",
      time: '1977-07-02T00:00:00Z',
    }
    return (
      <BCBaseMap {...{ viewport, onViewportChange }}>
        <WMSTileLayer
          url={process.env.REACT_APP_NCWMS_URL}
          {...wmsTileLayerProps}
        />
      </BCBaseMap>
    );
  }
}
