// Utility functions for displaying variables and their values in specified
// units.

import curry from 'lodash/fp/curry';
import find from 'lodash/fp/find';
import flow from 'lodash/fp/flow';
import isNumber from 'lodash/fp/isNumber';
import isString from 'lodash/fp/isString';
import isUndefined from 'lodash/fp/isUndefined';
import { convertUnitsInGroup } from './units'


// Functions that encapsulate knowledge about the structure of variable
// configuration information.

const getConfigForId = (variableConfig, variableId) => {
  const vc = variableConfig[variableId];
  if (!vc) {
    throw new Error(`Unconfigured variable '${variableId}'`);
  }
  return vc;
};

export const getVariableLabel = (variableConfig, variableId) => {
  const vc = getConfigForId(variableConfig, variableId);
  return `${vc.label}`;
};


export const getVariableType = (variableConfig, variableId, display = 'absolute') => {
  const vc = getConfigForId(variableConfig, variableId);
  if (display === 'relative') {
    return 'relative';
  }
  return vc.type;
};


export const getVariableDisplay = (variableConfig, variableId) => {
  return getConfigForId(variableConfig, variableId).display;
};


export const getVariableDataUnits =
  (variableConfig, variableId) => {
    const vc = getConfigForId(variableConfig, variableId);
    return vc.dataUnits;
  };


export const getVariableDisplayUnits =
  (variableConfig, variableId, display = 'absolute') => {
    const vc = getConfigForId(variableConfig, variableId);
    if (display === 'relative') {
      return vc.displayUnits || '%';  // Bombproofing
    }
    return vc.displayUnits;
  };


export const getVariableDisplayUnitsSpec =
  (unitsSpec, variableConfig, variableId, display = 'absolute') => {
    const type = getVariableType(variableConfig, variableId, display);
    const displayUnits =
      getVariableDisplayUnits(variableConfig, variableId, display);
    return unitsSpec[type][displayUnits];
  };


export const getVariableInfo = (unitsSpecs, variableConfig, variableId, display) => {
  return {
    id: variableId,
    label: getVariableLabel(variableConfig, variableId),
    unitsSpec: getVariableDisplayUnitsSpec(unitsSpecs, variableConfig, variableId, display),
    possibleLowBaseline: variableConfig[variableId].possibleLowBaseline,
  };
};


export const getConvertUnits = (unitsSpecs, variableConfig, variableId) => {
  const variableType = getVariableType(variableConfig, variableId);
  if (!variableType) {
    throw new Error(`Unspecified variable type for ${variableId}`);
  }
  const unitsGroup = unitsSpecs[variableType];
  if (!unitsGroup) {
    throw new Error(`No units group for ${variableType}`);
  }
  return convertUnitsInGroup(unitsGroup);
};


// Functions for formatting displayed values.

export const unitsSuffix = units => {
  if (isUndefined(units)) {
    return ' ???';
  }
  return `${units.match(/^[%]/) ? '' : ' '}${units}`;
};


export const expToFixed = s => {
  // Convert a string representing a number in exponential notation to a string
  // in (nominally) fixed point notation. Why? Because `Number.toPrecision()`
  // returns exponential notation frequently when we do not want it to. So
  // we apply this.
  const match = s.match(/-?\d\.\d+e[+-]\d+/);
  if (!match) {
    return s;
  }
  return Number.parseFloat(match[0]).toString();
};


export const displayFormat = curry((sigfigs, value) => {
  // Convert a number value to a string in the display format we prefer.
  if (!isNumber(value)) {
    return '--';
  }
  return `${value > 0 ? '+' : ''}${expToFixed(value.toPrecision(sigfigs))}`;
});
