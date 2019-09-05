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


// WMS tile layer props helpers

const wmsTileLayerStaticProps = {
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


const wmsLayerName = ({ fileMetadata, variable }) =>
  `${fileMetadata.unique_id}/${variable.representative.variable_id}`;


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


// Popup content getter

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


class DataMapDisplay extends React.Component {
  // This is a pure (state-free), controlled component that renders the
  // entire content of DataMap.
  //
  // It is wrapped with `withAsyncData` to inject the per-file metadata (prop
  // `fileMetadata`) it needs to construct layer props. See below.

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


// The following code injects the per-file metadata required by the pure
// component `DataMapDisplay`. By using the HOC `withAsyncData` to wrap
// `DataMapDisplay`, the state management and lifecycle hook trickiness for
// async data fetching is kept in a reliable, separate, single-purpose wrapper
// component, independent of the complexities of the wrapped component
// (`DataMapDisplay`). Separation of concerns.

// This function returns a filter that filters the complete set of metadata
// down to a single item that is the metadata for the layer to be displayed
// in DataMap.
const metadataFilter = props => {
  const criteria = {
    // start_date, end_date
    ...mapValues(v => v.toString())(props.timePeriod),
    // variable_id, variable_name, multi_year_mean
    ...props.variable.representative,
    // This little gem calls into question whether the CE TimeOfYearSelector
    // is very well suited to our purposes here.
    timescale: props.season === 16 ? 'yearly' : 'seasonal',
  };
  return filter(criteria)
};


// This function returns a promise for the file metadata needed by
// `DataMapDisplay` for the given props.
const loadFileMetadata = props => {
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
  )(props.metadata);
};


// This function determines when new file metadata should be loaded.
// Load when ...
const shouldLoadFileMetadata = (prevProps, props) =>
  // ... relevant props have settled to defined values
  props.timePeriod && props.season && props.variable &&
  // ... and there are either no previous props, or there is a difference
  // between previous and current relevant props
  !(prevProps &&
    isEqual(prevProps.timePeriod, props.timePeriod) &&
    isEqual(prevProps.season, props.season) &&
    isEqual(prevProps.variable, props.variable)
  );


// And now wrap with `withAsyncData`
const WithFileMetadataDataMapDisplay = withAsyncData(
  loadFileMetadata, shouldLoadFileMetadata, 'fileMetadata'
)(DataMapDisplay);

export default WithFileMetadataDataMapDisplay;
