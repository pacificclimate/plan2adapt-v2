// An ultrasimple component that transforms a (limited subset) GeoJSON object
// to a list of React Leaflet vector layers (Path objects).

import PropTypes from 'prop-types';
import React from 'react';
import { Polygon } from 'react-leaflet';

import _ from 'lodash';


const geoJSONPosition2LeafletPosition = (geoJSONPosition) =>
  [geoJSONPosition[1], geoJSONPosition[0]];


const geoJSONPositions2LeafletPositions = (geoJSONPositions) => {
  if (_.isArray(geoJSONPositions[0])) {
    return geoJSONPositions.map(geoJSONPositions2LeafletPositions);
  }
  return geoJSONPosition2LeafletPosition(geoJSONPositions);
};

const geometryType2Component = {
  Polygon: Polygon,
  MultiPolygon: Polygon,
};


function GeoJSONFeature({ feature, ...rest }) {
  const Component = geometryType2Component[feature.geometry.type];
  if (!Component) {
    console.log(`Unknown GeoJSON feature type:'${feature.geometry.type}'`)
    return null;
  }
  return (
    <Component
      positions={geoJSONPositions2LeafletPositions(
        feature.geometry.coordinates
      )}
      {...rest}
    />
  );
}

function geoJSON2Layers(geoJSON, rest) {
  switch (geoJSON && geoJSON.type) {
    case 'Feature':
      console.log('geoJSON2Layers: Feature');
      return <GeoJSONFeature feature={geoJSON} {...rest}/>;
    case 'FeatureCollection':
      console.log('geoJSON2Layers: FeatureCollection');
      return geoJSON.features.map(geoJSON2Layers);
    default:
      console.log('geoJSON2Layers: unknown', geoJSON && geoJSON.type);
      return null;
  }
}


export default function SimpleGeoJSON({ data, ...rest }) {
  return (
    <React.Fragment>
      {geoJSON2Layers(data, rest)}
    </React.Fragment>
  );
}

SimpleGeoJSON.propTypes = {
  data: PropTypes.object,
};
