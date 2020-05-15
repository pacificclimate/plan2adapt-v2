// Utility functions for displaying variables and their values in specified
// units.

import curry from 'lodash/fp/curry';
import isNumber from 'lodash/fp/isNumber';


export const getVariableLabel = (variableConfig, variable) =>
  `${variableConfig[variable].label}${variableConfig[variable].derived ? '*' : ''}`;


export const getDisplayUnits = (variableConfig, variable, display) => {
  if (display === 'relative') {
    return {
      target: '%',
      // no conversions
    };
  }
  return variableConfig[variable].displayUnits;
};


export const getVariableInfo = (variableConfig, variable, displayUnits) => {
  return {
    id: variable,
    label: getVariableLabel(variableConfig, variable),
    units: displayUnits.target,
  };
};


export const convertToDisplayUnits = curry(
  (displayUnits, baseUnits, value) => {
    if (displayUnits.target === baseUnits) {
      return value;
    }
    try {
      const conversion = displayUnits.conversions[baseUnits];
      const { scale, offset } = isNumber(conversion) ?
        { scale: conversion, offset: 0 } :
        conversion;
      return value * scale + offset;
    } catch (e) {
      return undefined;
    }
  }
);


export const unitsSuffix = units =>
  `${units.match(/^[%]/) ? '' : ' '}${units}`;


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


export const displayFormat = (sigfigs = 3) => (value) =>
  // Convert a number value to a string in the display format we prefer.
  `${value > 0 ? '+' : ''}${expToFixed(value.toPrecision(sigfigs))}`;

// TODO: Figure out why this fails.
// export const displayFormat = curry(
//   (sigfigs = 3, value) =>
//     // Convert a number value to a string in the display format we prefer.
//     `${value > 0 ? '+' : ''}${expToFixed(value.toPrecision(sigfigs))}`
// );



