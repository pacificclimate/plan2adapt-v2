import fromPairs from 'lodash/fp/fromPairs';
import flatten from 'lodash/fp/flatten';
import isArray from 'lodash/fp/isArray';
import flow from 'lodash/fp/flow';
import convert from 'lodash/fp/convert';
import placeholder from 'lodash/fp/placeholder';
import isUndefined from 'lodash/fp/isUndefined';
import curry from 'lodash/fp/curry';
import map from 'lodash/fp/map';
import get from 'lodash/fp/get';
import every from 'lodash/fp/every';

import { concatAll as stdConcatAll } from './lodash-extras';


export const concatAll = convert('concatAll', stdConcatAll);
concatAll.placeholder = placeholder;


export const isDefined = v => !isUndefined(v);


export const allDefined = curry((paths, object) => {
  // Returns a boolean indicating whether every path in `paths` accesses
  // a defined item in object.
  const items = map(path => get(path, object))(paths);
  return every(isDefined, items);
});



export const fromPairsMulti = pairs => {
  return flow(
    map(([keyish, value]) => {
      if (isArray(keyish)) {
        return map(key => [key, value])(keyish);
      }
      return [[keyish, value]];
    }),
    flatten,
    fromPairs,
  )(pairs);
};