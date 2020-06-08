import constant from 'lodash/fp/constant';
import curry from 'lodash/fp/curry';
import map from 'lodash/fp/map';
import range from 'lodash/fp/range';
import flow from 'lodash/fp/flow';
import flatten from 'lodash/fp/flatten';
import zipAll from 'lodash/fp/zipAll';
import isFunction from 'lodash/fp/isFunction';
import every from 'lodash/fp/every';


// TODO: Remove
export const interpolateBy = curry((n, v1, v2) => {
  // Compute `n` interpolated values between `v1` and `v2`.
  // Return an array `r` of `n` interpolated values, such that
  // `r[0] === v1`, `r[n] === v2`, and `r[i] < r[j]` for `0 <= i < j < n`.
  // Interpolation is linear.
  const delta = (v2 - v1) / n;
  return map(i => v1 + i * delta)(range(0, n));
});


// TODO: Remove
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


export const interpolateAt = curry((deltaX, x0, xT) => {
  // Compute linearly interpolated values `x[k] = x0 + k * deltaX`
  // for all integers `k` such that `x0 <= x[k] < xT`.
  return map(k => x0 + k * deltaX)(range(0, (xT - x0) / deltaX));
});



export const interpolateArrayAt = curry((deltaX, xs) => {
  // Compute linearly interpolated values between every successive
  // pair of points (xs[m], xs[m+1]), according to `deltaX`.
  const length = xs.length;
  return flow(
    range(0),
    map(m =>
      m < length-1 ?
        interpolateAt(deltaX, xs[m], xs[m+1]) :
        [xs[m]]
    ),
  )(length);
});


export const linearFn = curry((x0, y0, xT, yT) => {
  // Returns a function of x evaluating the line passing through
  // (x0, y0) and (xT, yT)
  const slope = (yT - y0) / (xT - x0);
  return x => y0 + slope * (x - x0);
});


export const linearFnArray = curry((xs, ys) => {
  // Returns an array of linear functions passing through successive pairs
  // of points (xs[m], ys[m]), (xs[m+1], ys[m+1])
  const length = xs.length;
  return flow(
    range(0),
    map(m =>
      m < length-1 ?
        linearFn(xs[m], ys[m], xs[m+1], ys[m+1]) :
        constant(ys[m])
    ),
  )(length);
});


export const linearInterpolator = curry((deltaX, xs, ys) => {
  // Returns a pair (length-2 array) containing
  // `[interpolatedXs, interpolatedYs]`
  //
  // `interpolatedXs` is the result of `interpolateArrayAt(deltaXs)`,
  // having the layout
  //    [ [x00, x01, x02, ... ], [x10, x11, x12, ...], ... ]
  //
  // `interpolatedYs` is the linear interpolation of the y values between
  // successive pairs of `ys`, evaluated at the values of `interpolatedXs`,
  // having the layout
  //    [ [y00, y01, y02, ...], [y10, y11, y12, ...], ... ]
  // where yij = Li(xij), and Li is the appropriate linear interpolation
  // function passing through points (xs[i], ys[i]) and (xs[i+1], ys[i+1]).
  const interpolatedXs = interpolateArrayAt(deltaX, xs);
  const yInterpolators = linearFnArray(xs, ys);
  // for each m, apply yInterpolators[m] to each value of interpolatedXs[m]
  const interpolatedYs = flow(
    zipAll,
    map(([yInterpolator, ixs]) => map(yInterpolator)(ixs)),
    // map(args => map(...args))
  )([yInterpolators, interpolatedXs]);
  return [
    interpolatedXs,
    interpolatedYs
  ];
});


export const fMultiple = curry((f, mult, value) => f(value/mult) * mult);
export const ceilMultiple = fMultiple(Math.ceil);
export const floorMultiple = fMultiple(Math.floor);
export const roundMultiple = fMultiple(Math.round);

export const percentileDatasetName = p => `${p}th`;
