import PropTypes from 'prop-types';
import React from 'react';
import { WMSTileLayer } from 'react-leaflet';
import T from '../../../temporary/external-text';
import { wmsClimateLayerProps } from '../map-utils';


export default class ClimateLayer extends React.Component {
  static contextType = T.contextType;

  static propTypes = {
    fileMetadata: PropTypes.object,
    variableSpec: PropTypes.object,
    season: PropTypes.number,
  };

  render() {
    const displaySpec = T.get(this.context, 'maps.displaySpec', {}, 'raw');
    return (
      <WMSTileLayer
        url={process.env.REACT_APP_NCWMS_URL}
        {...wmsClimateLayerProps(
          this.props.fileMetadata,
          displaySpec,
          this.props.variableSpec,
          this.props.season
        )}
      />
    );
  }
}
