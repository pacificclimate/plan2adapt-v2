import flow from 'lodash/fp/flow';
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


// TODO: Style and range should be part of config. But the configs
//  are getting a bit more structured than env variables will accommodate.

const variableId2WmsPalette = {
  pr: 'seq-Greens',
  tasmax: 'div-BuRd',
  tasmin: 'div-BuRd',
  fallback: 'seq-Oranges',
};
export const wmsPalette = variableSpec =>
  getOr(
    variableId2WmsPalette.fallback,
    variableSpec.variable_id,
    variableId2WmsPalette
  );


export const wmsStyle = variableSpec =>
  `default-scalar/${wmsPalette(variableSpec)}`;


const variableId2DataRange = {
  pr: { min: 0, max: 20 },
  tasmax: { min: -30, max: 40 },
  tasmin: { min: -40, max: 30 },
  fallback: { min: -40, max: 50 },
};
export const wmsDataRange = variableSpec =>
  getOr(
    variableId2DataRange.fallback,
    variableSpec.variable_id,
    variableId2DataRange
  );


const variableId2Ticks = {
  pr: [0, 5, 10, 15, 20],
  tasmax: [-30, -20, -10, 0, 10, 20, 30, 40],
  tasmin: [-40, -30, -20, -10, 0, 10, 20, 30],
  fallback: [0, 10],
};
export const wmsTicks = variableSpec =>
  getOr(
    variableId2Ticks.fallback,
    variableSpec.variable_id,
    variableId2Ticks
  );


export const wmsColorScaleRange = variableSpec => {
  const range = wmsDataRange(variableSpec);
  return `${range.min},${range.max}`
};


export const wmsClimateLayerProps = (fileMetadata, variableSpec, season) => {
  return {
    format: 'image/png',
    logscale: false,
    noWrap: true,
    numcolorbands: wmsNumcolorbands,
    opacity: 0.7,
    // srs: "EPSG:3005",
    transparent: true,
    version: '1.1.1',
    abovemaxcolor: 'black',
    belowmincolor: 'black',
    layers: wmsLayerName(fileMetadata, variableSpec),
    time: wmsTime(fileMetadata, season),
    styles: wmsStyle(variableSpec),
    colorscalerange: wmsColorScaleRange(variableSpec),
  }
};


