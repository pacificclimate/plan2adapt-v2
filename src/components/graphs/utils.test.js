import each from 'jest-each';
import isFunction from 'lodash/fp/isFunction'
import map from 'lodash/fp/map'
import range from 'lodash/fp/range'
import zip from 'lodash/fp/zip'
import zipAll from 'lodash/fp/zipAll'
import every from 'lodash/fp/every'
import {
  interpolateArrayAt,
  interpolateAt,
  linearFn,
  linearFnArray,
  linearInterpolator,
} from './utils';


describe('interpolateAt', () => {
  each([
    [1, 0, 0, []],
    [1, 0, 0.5, [0]],
    [1, 0, 1, [0]],
    [1, 0, 1.5, [0, 1]],
    [1, 0, 2, [0, 1]],
    [0.5, 0, 2, [0, 0.5, 1, 1.5]],
    [0.3, 0, 1, [0, 0.3, 0.6, 0.9]],
  ]).test('%d, %d, %d', (deltaX, x0, xT, expected) => {

    const result = interpolateAt(deltaX, x0, xT);
    for (const [r, e] of zip(result, expected)) {
      expect(r).toBeCloseTo(e);
    }
  });
});


describe('interpolateArrayAt', () => {
  each([
    [ 1, [0, 1], [ [0], [1] ] ],
    [ 1, [0, 2], [ [0, 1], [2] ] ],
    [ 1, [0, 2.5], [ [0, 1, 2], [2.5] ] ],
    [ 1, [0, 3], [ [0, 1, 2], [3] ] ],
    [ 1, [0, 1, 2], [ [0], [1], [2] ] ],
    [ 0.5, [0, 1], [ [0, 0.5], [1] ] ],
    [ 0.5, [0, 1, 2], [ [0, 0.5], [1, 1.5], [2] ] ],
    [ 0.3, [0, 1, 2], [ [0, 0.3, 0.6, 0.9], [1, 1.3, 1.6, 1.9], [2] ] ],
  ]).test('%d, %p', (deltaX, xs, expected) => {
    const result = interpolateArrayAt(deltaX, xs);
    expect(result.length).toBe(expected.length);
    for (const [rs, es] of zip(result, expected)) {
      expect(rs.length).toBe(es.length);
      for (const [r, e] of zip(rs, es)) {
        expect(r).toBeCloseTo(e);
      }
    }
  });
});


describe('linearFn', () => {
  each([
    [0, 0, 1, 0],
    [0, 0, 1, 1],
    [0, 1, 1, 2],
    [3, 11, -4, 7],
  ]).describe('(%d, %d), (%d, %d)', (x0, y0, xT, yT) => {
    const f = linearFn(x0, y0, xT, yT);
    each([
      [x0, y0],
      [xT, yT],
      [(xT + x0)/2, (yT + y0)/2],
    ]).test('f(%d) = %d', (x, y) => {
      expect(f(x)).toBeCloseTo(y);
    });
  });
});


describe('linearFnArray', () => {
  each([
    // [ [0], [0] ],
    [ [0, 1], [0, 1] ],
    [ [3, -4], [11, 7] ],
    [ [0, 1, 3, -4], [0, 1, 11, 7] ],
  ]).describe('for %p, %p', (xs, ys) => {
    const fs = linearFnArray(xs, ys);

    it('has the correct length', () => {
      expect(ys.length).toBe(xs.length);  // argument consistency
      expect(fs.length).toBe(xs.length);
    });

    test('each element is a function', () => {
      for (const f of fs) {
        expect(isFunction(f)).toBe(true);
      }
    });

    each(
      zipAll([xs, ys, fs])
    ).test('f(%d) = %d', (x, y, f) => {
      expect(f(x)).toBeCloseTo(y);
    });

    each(
      range(0, xs.length-1)
    ).describe('f[%d]', (i) => {
      const x0 = xs[i], y0 = ys[i];
      const xT = xs[i+1], yT = ys[i+1];
      const f = fs[i];
      each([
        [x0, y0],
        [xT, yT],
        [(xT + x0)/2, (yT + y0)/2],
      ]).test(`f[${i}](%d) = %d`, (x, y) => {
        expect(f(x)).toBeCloseTo(y);
      });
    });
  });
});


const expectEqualDifferences = values => {
  const pairs = zip(values.slice(0, values.length-1), values.slice(1));
  const diffs = map(([a, b]) => b - a)(pairs);
  expect(every(d => d === diffs[0])(diffs));
};


describe('linearInterpolator', () => {
  each([
    [ 1, [0, 1], [0, 1] ],
    [ 1, [0, 4, 7], [0, 1, 17] ],
  ]).describe('for %d, %p, %p', (deltaX, xs, ys) => {
    const [interpolatedXs, interpolatedYs] = linearInterpolator(deltaX, xs, ys);

    test('result lengths are correct', () => {
      expect(ys.length).toBe(xs.length);  // argument consistency
      expect(interpolatedXs.length).toBe(xs.length);
      expect(interpolatedYs.length).toBe(xs.length);
      for (const [ixs, iys] of zip(interpolatedXs, interpolatedYs)) {
        expect(ixs.length).toBe(iys.length);
      }
    });

    describe('iys[i][0] = ys[i]', () => {
      each(
        zip(interpolatedYs, ys)
      ).test('%p[0] = %d', (iys, y) => {
        expect(iys[0]).toBeCloseTo(y)
      });
    });

    describe('differences are equal', () => {
      each(
        range(0, xs.length)
      ).describe('subarray %d', (i) => {
        test(`interpolatedXs[${i}]`, () => {
          expectEqualDifferences(interpolatedXs[i]);
        });
        test(`interpolatedYs[${i}]`, () => {
          expectEqualDifferences(interpolatedYs[i]);
        });
      });
    });

  });
});
