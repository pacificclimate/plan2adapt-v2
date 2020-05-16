// Utility functions for displaying variables and their values in specified
// units.

import curry from 'lodash/fp/curry';
import find from 'lodash/fp/find';
import flow from 'lodash/fp/flow';
import isNumber from 'lodash/fp/isNumber';
import isString from 'lodash/fp/isString';


export const getVariableLabel = (variableConfig, variable) =>
  `${variableConfig[variable].label}${variableConfig[variable].derived ? '*' : ''}`;


export const getDisplayUnits =
  (variableConfig, variable, display = 'absolute') => {
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


export const convertToDisplayUnits = curry((displayUnits, baseUnits, value) => {
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
});


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


export const displayFormat = curry((sigfigs = 3) => (value) => {
  // Convert a number value to a string in the display format we prefer.
  if (!isNumber(value)) {
    return '--';
  }
  return `${value > 0 ? '+' : ''}${expToFixed(value.toPrecision(sigfigs))}`;
});


const findWithKey = find.convert({ 'cap': false });

export const findConversionGroup = curry((conversions, units) => {
  return find(
    findWithKey((value, key) => key === units)
  )(conversions);
});


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


export const convertUnits = curry((conversions, fromUnits, toUnits, value) => {
  if (fromUnits === toUnits) {
    return value;
  }
  const cGroup = findConversionGroup(conversions, fromUnits);
  if (!cGroup) {
    console.error('undefined units', fromUnits);
    return undefined;
  }
  const cGroup2 = findConversionGroup(conversions, toUnits);
  if (!cGroup2) {
    console.error('undefined units', toUnits);
    return undefined;
  }
  if (cGroup !== cGroup2) {
    console.error('incompatible units', fromUnits, toUnits);
  }
  return convertUnitsInGroup(cGroup, fromUnits, toUnits, value);
});
