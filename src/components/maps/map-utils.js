import flow from 'lodash/fp/flow';
import getOr from 'lodash/fp/getOr';
import map from 'lodash/fp/map';
import range from 'lodash/fp/range';

export const generateResolutions = (maxRes, count) =>
  map(i => maxRes / Math.pow(2, i)) (range(0, count));

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


export const wmsLayerName = ({ fileMetadata, variable }) =>
  `${fileMetadata.unique_id}/${variable.representative.variable_id}`;


export const wmsTime = ({ fileMetadata, season }) => {
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
export const wmsStyle = props => {
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
export const wmsColorScaleRange = props => {
  const range = getOr(
    variableId2ColourScaleRange.fallback,
    props.variable.representative.variable_id,
    variableId2ColourScaleRange
  );
  return `${range.min},${range.max}`
};


export const wmsTileLayerProps = props => {
  return {
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
    layers: wmsLayerName(props),
    time: wmsTime(props),
    styles: wmsStyle(props),
    colorscalerange: wmsColorScaleRange(props),
  }
  // return _.assign(
  //   {},
  //   wmsTileLayerStaticProps,
  //   {
  //     layers: wmsLayerName(props),
  //     time: wmsTime(props),
  //     styles: wmsStyle(props),
  //     colorscalerange: wmsColorScaleRange(props),
  //   }
  // );
};


