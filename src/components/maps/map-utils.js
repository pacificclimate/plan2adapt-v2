import L from 'leaflet';
import curry from 'lodash/fp/curry';
import flattenDepth from 'lodash/fp/flattenDepth';
import getOr from 'lodash/fp/getOr';
import map from 'lodash/fp/map';
import range from 'lodash/fp/range';

// Geometry


// Return depth in array at which position (coordinate tuples) are found
// for a given GeoJSON geometry (type).
export const geometryPositionDepth = geometryType => {
  switch (geometryType) {
    case 'Point': return 0;
    case 'MultiPoint': return geometryPositionDepth('Point') + 1;
    case 'LineString': return geometryPositionDepth('Point') + 1;
    case 'MultiLineString': return geometryPositionDepth('LineString') + 1;
    case 'LinearRing': return geometryPositionDepth('LineString');
    case 'Polygon': return geometryPositionDepth('LinearRing') + 1;
    case 'MultiPolygon': return geometryPositionDepth('Polygon') + 1;
  }
}


// Reverse order of lats and longs.
export const reverse = a => [a[1], a[0]];


// Return a Leaflet LatLngBounds object bounding the GeoJSON geometry object.
export const geometryBounds = geometry => {
  const depth = geometryPositionDepth(geometry.type);
  const lonLats = flattenDepth(depth-1)(geometry.coordinates);
  const latLngs = map(reverse)(lonLats);
  const bounds = L.latLngBounds(latLngs);
  return bounds;
}

// Return a Leaflet LatLngBounds object bounding the GeoJSON region object.
export const regionBounds = region => geometryBounds(region.geometry);


// Generic map helpers

export const generateResolutions = (maxRes, count) =>
  map(i => maxRes / Math.pow(2, i)) (range(0, count));


// WMS tile layer props helpers

export const wmsNumcolorbands = 249;


export const wmsLayerName = (fileMetadata, variableSpec) =>
  `${fileMetadata.unique_id}/${variableSpec.variable_id}`;


export const wmsTime = (fileMetadata, season) => {
  const timeIndexOffset = {
    'yearly': 16, 'seasonal': 12, 'monthly': 0
  }[fileMetadata.timescale];
  const timeIndex = (+season) - timeIndexOffset;
  return fileMetadata.times[timeIndex];
};


export const getDisplaySpecItem = curry(
  // Extract the relevant item (e.g., 'palette') from a display spec, which
  // is a configuration object retrieved from the external text file.
  (item, displaySpec, variableSpec) => getOr(
      displaySpec.fallback[item],
      [variableSpec.variable_id, item],
      displaySpec
    )
);

export const wmsLogscale = getDisplaySpecItem('logscale');
export const wmsPalette = getDisplaySpecItem('palette');
export const wmsDataRange = getDisplaySpecItem('range');
export const wmsTicks = getDisplaySpecItem('ticks');
export const wmsAboveMaxColor = getDisplaySpecItem('aboveMaxColor');
export const wmsBelowMinColor = getDisplaySpecItem('belowMinColor');


export const wmsStyle = (displaySpec, variableSpec) =>
  `default-scalar/${wmsPalette(displaySpec, variableSpec)}`;


export const wmsColorScaleRange = range => {
  return `${range.min},${range.max}`
};
