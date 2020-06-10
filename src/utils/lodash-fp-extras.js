import fromPairs from 'lodash/fp/fromPairs';
import flatten from 'lodash/fp/flatten';
import isArray from 'lodash/fp/isArray';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import convert from 'lodash/fp/convert';
import placeholder from 'lodash/fp/placeholder';

import { concatAll as stdConcatAll } from './lodash-extras';


export const concatAll = convert('concatAll', stdConcatAll);
concatAll.placeholder = placeholder;


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