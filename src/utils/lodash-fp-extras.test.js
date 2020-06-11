import each from 'jest-each';
import { concatAll, allDefined } from './lodash-fp-extras';


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

describe('allDefined', () => {
  each([
    [[], {}, true],
    [['a'], {}, false],
    [['a.b'], {}, false],
    [['a', 'b'], {}, false],
    [['a'], { 'a': 0 }, true],
    [['a'], { 'a': 1 }, true],
    [['a'], { 'a': 99 }, true],
    [['a'], { 'a': false }, true],
    [['a'], { 'a': true }, true],
    [['b'], { 'a': 0 }, false],
    [['a', 'b'], { 'a': 9, 'b': 99 }, true],
    [['a.b'], { 'a': { 'b': 99 }  }, true],
    [['a.b', 'a.b.c'], { 'a': { 'b': 99 }  }, false],
  ]).test('%p', (paths, object, expected) => {
    expect(allDefined(paths, object)).toEqual(expected);
  })
});

