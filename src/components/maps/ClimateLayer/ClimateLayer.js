import PropTypes from 'prop-types';
import React from 'react';
import { WMSTileLayer } from 'react-leaflet';
import mapValues from 'lodash/fp/mapValues';
import T from '../../../temporary/external-text';
import {
  getWmsAboveMaxColor,
  getWmsBelowMinColor,
  formatWmsColorScaleRange,
  getWmsDataRange,
  getWmsLayerName,
  getWmsLogscale,
  wmsNumcolorbands,
  getWmsStyle,
  getWmsTime
} from '../map-utils';
import {
  getConvertUnits, getVariableDataUnits, getVariableDisplay,
  getVariableDisplayUnits
} from '../../../utils/variables-and-units';
import merge from 'lodash/fp/merge';
import { collectionToCanonicalUnitsSpecs } from '../../../utils/units';
import { allDefined } from '../../../utils/lodash-fp-extras';
import Loader from 'react-loader';


export default class ClimateLayer extends React.Component {
  static contextType = T.contextType;
  getConfig = path => T.get(this.context, path, {}, 'raw');

  static propTypes = {
    fileMetadata: PropTypes.object,
    variableSpec: PropTypes.object,
    season: PropTypes.number,
    variableConfig: PropTypes.object,
    unitsSpecs: PropTypes.object,
  };

  render() {
    if (!allDefined(
      [
        'fileMetadata',
        'variableSpec',
        'season',
        'variableConfig',
        'unitsSpecs',
      ],
      this.props
    )) {
      console.log('### ClimateLayer: unsettled props', this.props)
      return <Loader />;
    }
    const {
      fileMetadata, variableSpec, season, variableConfig, unitsSpecs,
    } = this.props;
    const variableId = variableSpec.variable_id;

    // Convert the data range for the climate layer from display units, which
    // are convenient for the user to specify (in the config file), to data
    // units, which is what the data actually comes in.
    const display = getVariableDisplay(variableConfig, variableId);
    const displayUnits =
      getVariableDisplayUnits(variableConfig, variableId, display);
    // TODO: dataUnits should come from metadata, not config.
    const dataUnits = getVariableDataUnits(variableConfig, variableId);
    const convertUnits =
      getConvertUnits(unitsSpecs, variableConfig, variableId);

    const rangeInDisplayUnits = getWmsDataRange(variableConfig, variableId);
    const rangeInDataUnits = mapValues(
      convertUnits(displayUnits, dataUnits)
    )(rangeInDisplayUnits);

    return (
      <WMSTileLayer
        url={process.env.REACT_APP_NCWMS_URL}
        format={'image/png'}
        logscale={getWmsLogscale(variableConfig, variableId)}
        noWrap={true}
        numcolorbands={wmsNumcolorbands}
        opacity={0.0}
        // srs={"EPSG:3005"}
        transparent={true}
        version={'1.1.1'}
        abovemaxcolor={getWmsAboveMaxColor(variableConfig, variableId)}
        belowmincolor={getWmsBelowMinColor(variableConfig, variableId)}
        layers={getWmsLayerName(fileMetadata, variableId)}
        time={getWmsTime(fileMetadata, season)}
        styles={getWmsStyle(variableConfig, variableId)}
        colorscalerange={formatWmsColorScaleRange(rangeInDataUnits)}
      />
    );
  }
}
