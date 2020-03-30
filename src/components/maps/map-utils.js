import curry from 'lodash/fp/curry';
import getOr from 'lodash/fp/getOr';
import map from 'lodash/fp/map';
import range from 'lodash/fp/range';

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


export const wmsColorScaleRange = (displaySpec, variableSpec) => {
  const range = wmsDataRange(displaySpec, variableSpec);
  return `${range.min},${range.max}`
};


export const wmsClimateLayerProps = (fileMetadata, displaySpec, variableSpec, season, range) => {
  return {
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
    // colorscalerange: wmsColorScaleRange(displaySpec, variableSpec),
    colorscalerange: `${range.min},${range.max}`,
  }
};
