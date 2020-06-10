import each from 'jest-each';
import { concatAll } from './lodash-fp-extras';

describe('concatAll', () => {
  each([
    [ [], []],
    [ [[1,2]], [1,2]],
    [ [[1,2], [3,4]], [1,2,3,4]],
    [ [[1,2], [3,4], [5,6]], [1,2,3,4,5,6]],
    [ [[1,[2]]], [1,[2]]],
    [ [[1,2], [[3,4]]], [1,2,[3,4]]],
    [ [ [1,2], [[3,4], 5], [6, 7] ], [1,2,[3,4],5,6,7]],
  ]).test('%p', (input, expected) => {
    expect(concatAll(input)).toEqual(expected);
  })
});
