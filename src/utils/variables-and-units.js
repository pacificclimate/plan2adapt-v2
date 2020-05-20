// Utility functions for displaying variables and their values in specified
// units.

import curry from 'lodash/fp/curry';
import find from 'lodash/fp/find';
import flow from 'lodash/fp/flow';
import isNumber from 'lodash/fp/isNumber';
import isString from 'lodash/fp/isString';
import isUndefined from 'lodash/fp/isUndefined';


// Functions that encapsulate knowledge about the structure of variable
// configuration information.

export const getVariableLabel = (variableConfig, variable) =>
  `${variableConfig[variable].label}${variableConfig[variable].derived ? '*' : ''}`;


export const getVariableType = (variableConfig, variable) =>
  variableConfig[variable].type;


export const getVariableDisplayUnits =
  (variableConfig, variable, display = 'absolute') => {
    if (display === 'relative') {
      return '%';
    }
    return variableConfig[variable].displayUnits;
  };


export const getVariableInfo = (variableConfig, variable, display) => {
  return {
    id: variable,
    label: getVariableLabel(variableConfig, variable),
    units: getVariableDisplayUnits(variableConfig, variable, display),
  };
};


export const getConvertUnits= (conversions, variableConfig, variable) => {
  const variableType = getVariableType(variableConfig, variable);
  const conversionGroup = conversions[variableType];
  return convertUnitsInGroup(conversionGroup);
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


export const displayFormat = curry((sigfigs = 3) => (value) => {
  // Convert a number value to a string in the display format we prefer.
  if (!isNumber(value)) {
    return '--';
  }
  return `${value > 0 ? '+' : ''}${expToFixed(value.toPrecision(sigfigs))}`;
});


// Functions for units conversions. These functions are all curried so that
// partial application is greatly simplified. Note that assumptions about the
// layout of units conversion information is embedded in these functions.
// TODO: Place in separate module.

export const canonicalConversion = (conversion) => {
  return isNumber(conversion) ? { scale: conversion, offset: 0 } : conversion;
};


export const toBaseUnits = curry((conversion, value) =>
  conversion.scale * value + conversion.offset
);


export const fromBaseUnits = curry((conversion, value) =>
  (value - conversion.offset) / conversion.scale
);


export const convertUnitsInGroup = curry((conversionGroup, fromUnits, toUnits, value) => {
  if (!conversionGroup) {
    return undefined; // Or `value`?
  }
  if (fromUnits === toUnits) {  // Identity
    return value;
  }
  const fromConversion = conversionGroup[fromUnits];
  if (isString(fromConversion)) {  // Synonym
    return convertUnitsInGroup(conversionGroup, fromConversion, toUnits, value);
  }
  const toConversion = conversionGroup[toUnits];
  if (isString(toConversion)) {  // Synonym
    return convertUnitsInGroup(conversionGroup, fromUnits, toConversion, value);
  }
  return fromBaseUnits(canonicalConversion(toConversion), toBaseUnits(canonicalConversion(fromConversion), value));
});

