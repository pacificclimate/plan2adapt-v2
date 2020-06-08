import each from 'jest-each';
import { concatAll } from './lodash-fp-extras';
import { fromPairsMulti } from './lodash-fp-extras';


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


describe('fromPairsMulti', () => {
  each([
    [ [['a', 1], ['b', 2], ], { a: 1, b: 2 } ],
    [ [[['a1', 'a2', 'a3'], 1], ['b', 2], ], { a1: 1, a2: 1, a3: 1, b: 2 } ],
    [ [['a', 1], [['b1', 'b2', 'b3'], 2], ], { a: 1, b1: 2, b2: 2, b3: 2 } ],
  ]).test('%p', (input, expected) => {
    expect(fromPairsMulti(input)).toEqual(expected);
  });
});
