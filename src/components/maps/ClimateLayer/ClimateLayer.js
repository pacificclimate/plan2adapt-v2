import PropTypes from 'prop-types';
import React from 'react';
import { WMSTileLayer } from 'react-leaflet';
import mapValues from 'lodash/fp/mapValues';
import T from '../../../temporary/external-text';
import {
  wmsAboveMaxColor, wmsBelowMinColor,
  wmsColorScaleRange, wmsDataRange, wmsLayerName,
  wmsLogscale,
  wmsNumcolorbands, wmsStyle, wmsTime
} from '../map-utils';
import {
  getConvertUnits,
  getVariableDisplayUnits
} from '../../../utils/variables-and-units';


export default class ClimateLayer extends React.Component {
  static contextType = T.contextType;
  getConfig = path => T.get(this.context, path, {}, 'raw');

  static propTypes = {
    fileMetadata: PropTypes.object,
    variableSpec: PropTypes.object,
    season: PropTypes.number,
  };

  render() {
    const { fileMetadata, variableSpec, season } = this.props;
    const variable = variableSpec.variable_id;
    const displaySpec = this.getConfig('maps.displaySpec');
    const variableConfig = this.getConfig('variables');
    const unitsConversions = this.getConfig('units');

    // Convert the data range for the climate layer from display units, which
    // are convenient for the user to specify (in the config file), to data
    // units, which is what the data actually comes in.
    const rangeInDisplayUnits = wmsDataRange(displaySpec, variableSpec);
    const displayUnits =
      getVariableDisplayUnits(variableConfig, variable, 'absolute');
    // TODO: dataUnits should come from metadata, not config.
    const dataUnits = variableConfig[variable].dataUnits;
    const convertUnits =
      getConvertUnits(unitsConversions, variableConfig, variable);
    const rangeInDataUnits = mapValues(
      convertUnits(displayUnits, dataUnits)
    )(rangeInDisplayUnits);

    const layerProps = {
      format: 'image/png',
      logscale: wmsLogscale(displaySpec, variableSpec),
      noWrap: true,
      numcolorbands: wmsNumcolorbands,
      opacity: 0.7,
      // srs: "EPSG:3005",
      transparent: true,
      version: '1.1.1',
      abovemaxcolor: wmsAboveMaxColor(displaySpec, variableSpec),
      belowmincolor: wmsBelowMinColor(displaySpec, variableSpec),
      layers: wmsLayerName(fileMetadata, variableSpec),
      time: wmsTime(fileMetadata, season),
      styles: wmsStyle(displaySpec, variableSpec),
      colorscalerange: wmsColorScaleRange(rangeInDataUnits),
    };

    return (
      <WMSTileLayer
        url={process.env.REACT_APP_NCWMS_URL}
        {...layerProps}
      />
    );
  }
}
