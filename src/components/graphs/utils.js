import curry from 'lodash/fp/curry';
import map from 'lodash/fp/map';
import range from 'lodash/fp/range';
import flow from 'lodash/fp/flow';
import flatten from 'lodash/fp/flatten';


export const interpolateBy = curry((n, v1, v2) => {
  // Compute `n` interpolated values between `v1` and `v2`.
  // Return an array `r` of `n` interpolated values, such that
  // `r[0] === v1`, `r[n] === v2`, and `r[i] < r[j]` for `0 <= i < j < n`.
  // Interpolation is linear.
  const delta = (v2 - v1) / n;
  return map(i => v1 + i * delta)(range(0, n));
});


export const interpolateArrayBy = curry((n, a) => {
  // Compute `n` interpolated values between each successive pair of
  // values in array `a`.
  // Return an array `r` of `m = (a.length-1) * n + 1` interpolated values
  // with r[0] = a[0], r[m-1] = a[a.length-1].
  const length = a.length;
  return flow(
    range(0),
    map(i => i < length-1 ? interpolateBy(n, a[i], a[i+1]) : a[i]),
    flatten,
  )(length);
});


export const fMultiple = curry((f, mult, value) => f(value/mult) * mult);
export const ceilMultiple = fMultiple(Math.ceil);
export const floorMultiple = fMultiple(Math.floor);
export const roundMultiple = fMultiple(Math.round);

export const percentileDatasetName = p => `${p}th`;




