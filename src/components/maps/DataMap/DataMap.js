import PropTypes from 'prop-types';
import React from 'react';
import BCBaseMap from '../BCBaseMap';
import { WMSTileLayer } from 'react-leaflet';
import _ from 'lodash';
import './DataMap.css';


export default class DataMap extends React.Component {
  static propTypes = {
    region: PropTypes.string,
    timePeriod: PropTypes.object,
    season: PropTypes.string,
    variable: PropTypes.string,
  };

  static wmsTileLayerStaticProps = {
    elevation: 0,
    format: 'image/png',
    logscale: false,
    noWrap: true,
    numcolorbands: 254,
    opacity: 0.7,
    // srs: "EPSG:3005",
    styles: 'boxfill/blue6_red4',
    transparent: true,
    version: '1.1.1',
  };

  static wmsTileLayerProps = ({ region, season, timePeriod, variable }) => {
    // For P2A v1
    const { start_date, end_date } = timePeriod;
    const colorscalerange = {
      tas: '249.15,289.15',
      pr: '0,0.000347222222222222',
      pass: '0,10000',
    }[variable];
    const styles = {
      tas: 'boxfill/blue6_red4',
      pr: 'boxfill/lightblue_darkblue_log_nc',
      pass: 'boxfill/lightblue_darkblue_log_nc',
    }[variable];
    const layerName =
      +start_date < 2010 ?
        `climatebc-hist-${variable}-run1` :
        `climatebc-abs_a2-${variable}-cgcm3_4`;
    const middleYear =
      +start_date < 2010 ?
        Math.floor(((+start_date) + (+end_date)) / 2) :
        Math.floor(((+start_date) + (+end_date) + 1) / 2);

    return _.assign({}, DataMap.wmsTileLayerStaticProps, {
      colorscalerange,
      styles,
      layers: `${layerName}-${start_date}-${end_date}/${variable}`,
      time: `${middleYear}-07-01T00:00:00Z`,
    });
  };

  render() {
    const { viewport, onViewportChange } = this.props;
    // For CE (mismatch of base layer, argh)
    // const wmsTileLayerProps = {
    //   format: "image/png",
    //   logscale: false,
    //   noWrap: true,
    //   numcolorbands: 249,
    //   opacity: 0.7,
    //   // srs: "EPSG:4326",  // base map overrides, natch
    //   styles: 'default-scalar/seq-Greens',
    //   transparent: true,
    //   version: '1.1.1',
    //
    //   layers: "pr_aClim_BCCAQv2_CanESM2_historical-rcp85_r1i1p1_19610101-19901231_Canada/pr",
    //   time: '1977-07-02T00:00:00Z',
    // };

    return (
      <BCBaseMap {...{ viewport, onViewportChange }}>
        <WMSTileLayer
          url={process.env.REACT_APP_NCWMS_URL}
          {...DataMap.wmsTileLayerProps(this.props)}
        />
      </BCBaseMap>
    );
  }
}
