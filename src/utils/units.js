// This module provides units conversion.
//
// In order to convert units, this module requires a units definition object.
// That object defines (in a form that is easy for users to write) units with
// both naming/labelling information and inter-unit conversion information.
// (For example, it could describe the conversion between Celcius and Fahrenheit
// temperature units.)
//
// Units are divided into groups or categories. This may seem unnecessary at
// first glance, but two examples suffice to show its necessity. First, consider
// temperature units: temperatures may be absolute (e.g., it is 18 deg C outside
// today) or difference (e.g., it is 5 deg C warmer today than yesterday. For
// absolute units, conversion requires both a scaling factor (1.8 deg F/deg C)
// and offset (32 deg F) applied; for difference units only the scaling factor
// should be applied. Second, consider conversion between precipitation as
// liquid and precipitation as snowfall (estimated from liquid as 10x liquid
// depth). These are both commonly presented in mm or cm, but in fact require
// different conversion factors. (This second case is more tenuous, but it
// does occur in this app and is more convenient than converting base
// datasets.)
//
// The units definition object has the following structure:
//
//    {
//      <group name>: {
//        <unit spec>,
//        ...
//      },
//      ...
//    }
//
// where unit spec is canonically the following structure:
//
//        <unit id>: {
//          label: String; default <unit id>
//          scale: Number; default 1
//          offset: Number; default 0
//        }
//
// Default values are applied if a property is not specified.
//
// For convenience, the following shorthand notations can be used for
// <unit spec>. These shorthand notations are converted internally into a
// canonical <unit spec> object.
//
//  1. Synonym: The same unit conversion, relabelled.
//
//    <unit id>: {
//      label: String; default <unit id>,
//      synonymFor: String,
//    }
//
//  Property `synonymFor` is the <unit id> of another spec in the same group.
//  The new label replaces the label of the other unit spec.
//
//  OR
//
//    <unit id>: String
//
//  in which the string value specifies the `synonymFor`.
//
//  2. Scale: specifies `scale` only.
//
//    <unit id>: Number
//
// Shorthand translations are applied recursively until a canonical units
// spec is reached.

import mapValues from 'lodash/fp/mapValues';
import isUndefined from 'lodash/fp/isUndefined';
import isNumber from 'lodash/fp/isNumber';
import isString from 'lodash/fp/isString';
import { mapValuesWithKey } from './lodash-fp-extras';


export const toCanonicalUnitSpec = (group, unitId) => {
  // Convert a single unit spec within a group to its canonical form.
  // The spec converted is selected from `group` by `unitId`.

  const spec = group[unitId];
  if (isUndefined(spec)) {
    throw new Error(`Undefined units spec for unit id '${unitId}'`);
  }
  if (isNumber(spec)) {
    return {
      label: unitId,
      scale: spec,
      offset: 0,
    };
  }
  if (isString(spec)) {
    return {
      ...toCanonicalUnitSpec(group, spec),
      label: unitId,
    };
  }
  if (spec.synonymFor) {
    return {
      ...toCanonicalUnitSpec(group, spec.synonymFor),
      label: spec.label || unitId,
    };
  }
  return {
    label: spec.label || unitId,
    scale: spec.scale || 1,
    offset: spec.offset || 0,
  };
};


export const groupToCanonicalUnitsSpecs = group => {
  // Convert all units specs in a group to canonical form.
  return mapValuesWithKey(
    (spec, unitId) => toCanonicalUnitSpec(group, unitId),
    group
  );
};


export const collectionToCanonicalUnitsSpecs =
  // Convert all groups of units specs in a collection to canonical form.
  mapValues(groupToCanonicalUnitsSpecs);

