import flow from 'lodash/fp/flow';
import toPairs from 'lodash/fp/toPairs';
import map from 'lodash/fp/map';
import join from 'lodash/fp/join';


// Convert a hash to a query parameters string suitable for use in a URI.
// This function is ultra-simple; for a full featured library use npm `qs`.
export const qsStringify =
  flow(
    toPairs,
    map(([key, value]) => `${key}=${value}`),
    join('&')
  );


// Make a URI by joining the `url` to a query string formed from object
// `params`. Result is URI-encoded.
export const makeURI = (url, params) =>
  encodeURI(`${url}?${qsStringify(params)}`);
