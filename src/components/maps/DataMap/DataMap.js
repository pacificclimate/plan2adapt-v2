import PropTypes from 'prop-types';
import React from 'react';

import axios from 'axios';
import { xml2js } from 'xml-js';
import _ from 'lodash';
import isEqual from 'lodash/fp/isEqual';
import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import getOr from 'lodash/fp/getOr';
import map from 'lodash/fp/map';
import mapValues from 'lodash/fp/mapValues';
import keys from 'lodash/fp/keys';
import fromPairs from 'lodash/fp/fromPairs';

import { BCBaseMap } from 'pcic-react-leaflet-components';
import CanadaBaseMap from '../CanadaBaseMap';
import { WMSTileLayer } from 'react-leaflet';
import LayerValuePopup from '../LayerValuePopup';
import withAsyncData from '../../../HOCs/withAsyncData';

import './DataMap.css';
import { fetchFileMetadata } from '../../../data-services/metadata';
export const mapValuesWithKey = mapValues.convert({ cap: false });
export const filterWithKey = filter.convert({ cap: false });



const wmsTileLayerStaticProps = {
  // elevation: 0,
  // format: 'image/png',
  // logscale: false,
  // noWrap: true,
  // numcolorbands: 254,
  // opacity: 0.7,
  // // srs: "EPSG:3005",
  // styles: 'boxfill/blue6_red4',
  // transparent: true,
  // version: '1.1.1',
  format: 'image/png',
  logscale: false,
  noWrap: true,
  numcolorbands: 249,
  opacity: 0.7,
  // srs: "EPSG:3005",
  transparent: true,
  version: '1.1.1',
  abovemaxcolor: 'red',
  belowmincolor: 'black',
};
// For CE (mismatch of base layer, argh)
// const wmsTileLayerProps = {
//   numcolorbands: 249,
//   // srs: "EPSG:4326",  // base map overrides, natch
// };


const wmsLayerName = ({ fileMetadata, variable }) =>
{
  return `${fileMetadata.unique_id}/${variable.representative.variable_id}`;
};

const wmsTime = ({ fileMetadata, season }) => {
  const timeIndexOffset = {
    'yearly': 16, 'seasonal': 12, 'monthly': 0
  }[fileMetadata.timescale];
  const timeIndex = (+season) - timeIndexOffset;
  return fileMetadata.times[timeIndex];
};


// TODO: Style and range should be part of config. But the configs
//  are getting a bit more structured than env variables will accommodate.

const variableId2WmsStyle = {
  pr: 'seq-Greens',
  tasmax: 'x-Occam',
  tasmin: 'x-Occam',
  fallback: 'seq-Oranges',
};
const wmsStyle = props => {
  const palette = getOr(
    variableId2WmsStyle.fallback,
    props.variable.representative.variable_id,
    variableId2WmsStyle
  );
  return `default-scalar/${palette}`
};


const variableId2ColourScaleRange = {
  pr: { min: 0, max: 20 },
  tasmax: { min: -30, max: 50 },
  tasmin: { min: -40, max: 40 },
  fallback: { min: -40, max: 50 },
};
const wmsColorScaleRange = props => {
  const range = getOr(
    variableId2ColourScaleRange.fallback,
    props.variable.representative.variable_id,
    variableId2ColourScaleRange
  );
  return `${range.min},${range.max}`
};

const wmsTileLayerProps = props => {
  return _.assign(
    {},
    wmsTileLayerStaticProps,
    {
      layers: wmsLayerName(props),
      time: wmsTime(props),
      styles: wmsStyle(props),
      colorscalerange: wmsColorScaleRange(props),
    }
  );
};


const getLayerInfo = ({ layerSpec, layerPoint: xy }) => {
  return axios.get(
    process.env.REACT_APP_NCWMS_URL,
    {
      params: {
        request: 'GetFeatureInfo',
        exceptions: 'application/vnd.ogc.se_xml',
        ...xy,
        info_format: 'text/xml', // f**k, only xml is available
        query_layers: wmsLayerName(layerSpec),
        time: wmsTime(layerSpec),
        feature_count: 50,  // ??
        version: '1.1.1',
      },
    },
  );
};


let count = 0;

class DataMapDisplay extends React.Component {
  // This is a pure (state-free), controlled component that renders the
  // entire content of DataMap.

  static propTypes = {
    region: PropTypes.string,
    timePeriod: PropTypes.object,
    season: PropTypes.string,
    variable: PropTypes.string,
    popup: PropTypes.object,
    onPopupChange: PropTypes.func,
    fileMetadata: PropTypes.object,
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
    getLayerInfo({
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
    // console.log(`### DataMap [${this.props.id}]: wmsTileLayerProps`,
    //   wmsTileLayerProps(this.props))
    const { viewport, onViewportChange, onViewportChanged } = this.props;

    return (
      <CanadaBaseMap
        {...{ viewport, onViewportChange, onViewportChanged }}
        onClick={this.handleClickMap}
      >
        <WMSTileLayer
          url={process.env.REACT_APP_NCWMS_URL}
          {...wmsTileLayerProps(this.props)}
        />
        {
          this.props.popup.isOpen &&
          <LayerValuePopup
            {...this.props.popup}
            onClose={this.handleClosePopup}
          />
        }
      </CanadaBaseMap>
    );
  }
}


// This function returns a filter that filters the complete set of metadata
// down to a single item that is the metadata for the layer to be displayed
// in DataMap.
const metadataFilter = props => {
  const criteria = {
    ...mapValues(v => v.toString())(props.timePeriod),  // start_date, end_date
    ...props.variable.representative,  // variable_id, variable_name, multi_year_mean
    // This little gem calls into question whether the CE TimeOfYearSelector
    // is very well suited to our purposes here.
    timescale: props.season === 16 ? 'yearly' : 'seasonal',
  };
  console.log('### metadataFilter criteria', criteria)
  return filter(
    criteria
  )};


const loadFileMetadata = props => {
  console.log('### loadFileMetadata')
  return flow(
    metadataFilter(props),
    metadata => {
      // TODO: Don't throw an error when metadata matching fails. Instead,
      //   show an error message in the map.
      if (metadata.length === 0) {
        throw new Error('No matching metadata');
      }
      if (metadata.length > 1) {
        console.error('Too many matching metadata', metadata);
        throw new Error('Too many matching metadata');
      }
      return metadata[0].unique_id;
    },
    fetchFileMetadata
    // map('unique_id'),
    // map(fetchFileMetadata),
  )(props.metadata);
};

const shouldLoadFileMetadata = (prevProps, props) =>
  // When props for loading have settled to defined values
  props.timePeriod && props.season && props.variable &&
  // and there are either no previous props, or there is a difference
  // between previous and current props
  !(prevProps &&
    isEqual(prevProps.timePeriod, props.timePeriod) &&
    isEqual(prevProps.season, props.season) &&
    isEqual(prevProps.variable, props.variable)
  );

const WithFileMetadataDataMapDisplay = withAsyncData(
  loadFileMetadata, shouldLoadFileMetadata, 'fileMetadata'
)(DataMapDisplay);

export default WithFileMetadataDataMapDisplay;
