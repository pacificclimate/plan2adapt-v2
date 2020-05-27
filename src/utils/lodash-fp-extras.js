import convert from 'lodash/fp/convert';
import placeholder from 'lodash/fp/placeholder';

import { concatAll as stdConcatAll } from './lodash-extras';


export const concatAll = convert('concatAll', stdConcatAll);
concatAll.placeholder = placeholder;
