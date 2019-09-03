import axios from 'axios';
import urljoin from 'url-join';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
export const mapWithKey = map.convert({ cap: false });


const getYear = timestamp => timestamp.substr(0, 4);


export const standardize = flow(
  // Map dict to array of array of standardized items. Each standardized item
  // has a unique combination of values for unique_id, variable_id, and 
  // variable_name, unrolled from the dicts in the original data,
  // along with all the other properties that came with the dict.
  // Properties start_date and end_date are truncated to year only.
  mapWithKey(({ variables, start_date, end_date, ...rest }, unique_id) =>
    mapWithKey((variable_name, variable_id) => ({
      unique_id,
      variable_id,
      variable_name,
      start_date: getYear(start_date),
      end_date: getYear(end_date),
      ...rest
    }))(variables)
  ),
  
  // And flatten the nested arrays.
  flatten,
);


export function getMetadata() {
  console.log('getMetadata()')
  return axios.get(
    urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'multimeta'),
    {
      params: {
        ensemble_name: process.env.REACT_APP_ENSEMBLE_NAME,
        model: process.env.REACT_APP_MODEL_ID,
      },
      transformResponse: [JSON.parse, standardize],
    },
  )
}