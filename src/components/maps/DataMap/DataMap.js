import PropTypes from 'prop-types';
import React from 'react';
import { BCBaseMap } from 'pcic-react-leaflet-components';
import { WMSTileLayer } from 'react-leaflet';
import axios from 'axios';
import { xml2js } from 'xml-js';
import _ from 'lodash';
import './DataMap.css';
import LayerValuePopup from '../LayerValuePopup';


export default class DataMap extends React.Component {
  static propTypes = {
    region: PropTypes.string,
    timePeriod: PropTypes.object,
    season: PropTypes.string,
    variable: PropTypes.string,
    popup: PropTypes.object,
    onPopupChange: PropTypes.func,
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

  static wmsLayerName = ({ timePeriod: { start_date, end_date }, variable }) =>
  {
    const rootLayerName =
      +start_date < 2010 ?
        `climatebc-hist-${variable}-run1` :
        `climatebc-abs_a2-${variable}-cgcm3_4`;
      return`${rootLayerName}-${start_date}-${end_date}/${variable}`
  };

  static wmsTime = ({ timePeriod: { start_date, end_date } }) => {
    const middleYear =
      +start_date < 2010 ?
        Math.floor(((+start_date) + (+end_date)) / 2) :
        Math.floor(((+start_date) + (+end_date) + 1) / 2);
    return `${middleYear}-07-01T00:00:00Z`
  };

  static wmsTileLayerProps = ({ region, season, timePeriod, variable }) => {
    // For P2A v1
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

    return _.assign({}, DataMap.wmsTileLayerStaticProps, {
      colorscalerange,
      styles,
      layers: DataMap.wmsLayerName({ timePeriod, variable }),
      time: DataMap.wmsTime({ timePeriod }),
    });
  };

  static getLayerInfo = ({ layerSpec, layerPoint: xy }) => {
    return axios.get(
      process.env.REACT_APP_NCWMS_URL,
      {
        params: {
          request: 'GetFeatureInfo',
          exceptions: 'application/vnd.ogc.se_xml',
          ...xy,
          info_format: 'text/xml', // f**k, only xml is available
          query_layers: DataMap.wmsLayerName(layerSpec),
          time: DataMap.wmsTime(layerSpec),
          feature_count: 50,  // ??
          version: '1.1.1',
        },
      },
    );
  };

  handleClickMap = (event) => {
    console.log('map click ', event)
    // Open popup on map
    this.props.onPopupChange({
      ...this.props.popup,
      isOpen: true,
      position: event.latlng,
      value: null,  // value loading
    });

    // Get a value for it
    DataMap.getLayerInfo({
      layerSpec: this.props,
      xy: event.layerPoint,
    })
    .then(response => {
      const layerInfo = xml2js(response.data, {
        compact: true,
      });
      const value = layerInfo.foo;
      this.props.onPopupChange({
        ...this.props.popup,
        value,
        error: null,
      });
    })
    .catch(error => {
      console.log('error.response', error.response)
      console.log('error.request', error.request)
      console.log('error.message', error.message)
      console.log('error.config', error.config)
      this.props.onPopupChange({
        ...this.props.popup,
        value: null,
        error,
      });
    });
  };

  handleClosePopup = () => this.props.onPopupChange({
    ...this.props.popup, isOpen: false, value: null,
  });

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
      <BCBaseMap {...{ viewport, onViewportChange }}
        onClick={this.handleClickMap}
      >
        <WMSTileLayer
          url={process.env.REACT_APP_NCWMS_URL}
          {...DataMap.wmsTileLayerProps(this.props)}
        />
        {
          this.props.popup.isOpen &&
          <LayerValuePopup
            {...this.props.popup}
            onClose={this.handleClosePopup}
          />
        }
      </BCBaseMap>
    );
  }
}
