import L from "leaflet";
import curry from "lodash/fp/curry";
import flattenDepth from "lodash/fp/flattenDepth";
import getOr from "lodash/fp/getOr";
import map from "lodash/fp/map";
import range from "lodash/fp/range";

// Geometry

// Return depth in array at which position (coordinate tuples) are found
// for a given GeoJSON geometry (type).
export const geometryPositionDepth = (geometryType) => {
  switch (geometryType) {
    case "Point":
      return 0;
    case "MultiPoint":
      return geometryPositionDepth("Point") + 1;
    case "LineString":
      return geometryPositionDepth("Point") + 1;
    case "MultiLineString":
      return geometryPositionDepth("LineString") + 1;
    case "LinearRing":
      return geometryPositionDepth("LineString");
    case "Polygon":
      return geometryPositionDepth("LinearRing") + 1;
    case "MultiPolygon":
      return geometryPositionDepth("Polygon") + 1;
    default:
      return 0;
  }
};

// Reverse order of lats and longs.
export const reverse = (a) => [a[1], a[0]];

// Leaflet-specific helpers

// Return a Leaflet LatLngBounds object bounding the GeoJSON geometry object.
export const geometryBounds = (geometry) => {
  const depth = geometryPositionDepth(geometry.type);
  const lonLats = flattenDepth(depth - 1)(geometry.coordinates);
  const latLngs = map(reverse)(lonLats);
  const bounds = L.latLngBounds(latLngs);
  return bounds;
};

// Return a Leaflet LatLngBounds object bounding the GeoJSON region object.
export const regionBounds = (region) => geometryBounds(region.geometry);

// Return a viewport object for a given map corresponding to the given bounds.
export const boundsToViewport = (map, bounds) => ({
  center: bounds.getCenter(),
  zoom: map.getBoundsZoom(bounds),
});

// Generic map helpers

export const generateResolutions = (maxRes, count) =>
  map((i) => maxRes / Math.pow(2, i))(range(0, count));

// WMS tile layer props helpers

export const wmsNumcolorbands = 249;

export const getWmsLayerName = (fileMetadata, variableId) => {
  // The dataset identifier can be either a dynamic dataset identifier, which
  // involves the full filepath, or a simple dataset identifier, which uses
  // just the dataset unique_id. Default behaviour is "simple".
  const datasetId =
    window.env.REACT_APP_MAP_LAYER_ID_TYPE === "dynamic"
      ? `${window.env.REACT_APP_MAP_LAYER_ID_PREFIX}${fileMetadata.filepath}`
      : fileMetadata.unique_id;
  return `${datasetId}/${variableId}`;
};

export const getWmsTime = (fileMetadata, season) => {
  const timeIndexOffset = {
    yearly: 16,
    seasonal: 12,
    monthly: 0,
  }[fileMetadata.timescale];
  const timeIndex = +season - timeIndexOffset;
  return fileMetadata.times[timeIndex];
};

export const getVariableSpecItem = curry(
  // Extract the relevant item (e.g., 'palette') from a variable spec, which
  // is a configuration object.
  (item, variableSpec, variableId) =>
    getOr(variableSpec.fallback[item], [variableId, item], variableSpec),
);

export const getWmsLogscale = getVariableSpecItem("logscale");
export const getWmsPalette = getVariableSpecItem("palette");
export const getWmsDataRange = getVariableSpecItem("range");
export const getWmsTicks = getVariableSpecItem("ticks");
export const getWmsAboveMaxColor = getVariableSpecItem("aboveMaxColor");
export const getWmsBelowMinColor = getVariableSpecItem("belowMinColor");

export const getWmsStyle = (displaySpec, variableId) =>
  `default-scalar/${getWmsPalette(displaySpec, variableId)}`;

export const formatWmsColorScaleRange = (range) => {
  return `${range.min},${range.max}`;
};
