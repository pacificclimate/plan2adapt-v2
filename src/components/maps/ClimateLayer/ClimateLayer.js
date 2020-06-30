import PropTypes from 'prop-types';
import React from 'react';
import { WMSTileLayer } from 'react-leaflet';
import mapValues from 'lodash/fp/mapValues';
import T from '../../../temporary/external-text';
import {
  wmsAboveMaxColor,
  wmsBelowMinColor,
  wmsColorScaleRange,
  wmsDataRange,
  wmsLayerName,
  wmsLogscale,
  wmsNumcolorbands,
  wmsStyle,
  wmsTime
} from '../map-utils';
import {
  getConvertUnits, getVariableDataUnits, getVariableDisplay,
  getVariableDisplayUnits
} from '../../../utils/variables-and-units';
import merge from 'lodash/fp/merge';
import { collectionToCanonicalUnitsSpecs } from '../../../utils/units';


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
    const variableId = variableSpec.variable_id;
    // TODO: Pull config up!!!! We're repeating far too much here.
    const mapsConfig = this.getConfig('tabs.maps.config');
    const variableConfig = merge(
      this.getConfig('variables'),
      mapsConfig.variables,
    );
    console.log('### ClimateLayer: variableConfig', variableConfig)
    const unitsConversions =
      collectionToCanonicalUnitsSpecs(this.getConfig('units'));

    // Convert the data range for the climate layer from display units, which
    // are convenient for the user to specify (in the config file), to data
    // units, which is what the data actually comes in.
    const display = getVariableDisplay(variableConfig, variableId);
    const displayUnits =
      getVariableDisplayUnits(variableConfig, variableId, display);
    // TODO: dataUnits should come from metadata, not config.
    const dataUnits = getVariableDataUnits(variableConfig, variableId);
    const convertUnits =
      getConvertUnits(unitsConversions, variableConfig, variableId);

    const rangeInDisplayUnits = wmsDataRange(variableConfig, variableSpec);
    const rangeInDataUnits = mapValues(
      convertUnits(displayUnits, dataUnits)
    )(rangeInDisplayUnits);

    return (
      <WMSTileLayer
        url={process.env.REACT_APP_NCWMS_URL}
        format={'image/png'}
        logscale={wmsLogscale(variableConfig, variableSpec)}
        noWrap={true}
        numcolorbands={wmsNumcolorbands}
        opacity={0.7}
        // srs={"EPSG:3005"}
        transparent={true}
        version={'1.1.1'}
        abovemaxcolor={wmsAboveMaxColor(variableConfig, variableSpec)}
        belowmincolor={wmsBelowMinColor(variableConfig, variableSpec)}
        layers={wmsLayerName(fileMetadata, variableSpec)}
        time={wmsTime(fileMetadata, season)}
        styles={wmsStyle(variableConfig, variableSpec)}
        colorscalerange={wmsColorScaleRange(rangeInDataUnits)}
      />
    );
  }
}
