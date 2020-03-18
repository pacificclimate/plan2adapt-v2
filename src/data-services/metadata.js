import axios from 'axios';
import urljoin from 'url-join';
import includes from 'lodash/fp/includes';
import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import tap from 'lodash/fp/tap';
import groupBy from 'lodash/fp/groupBy';
import head from 'lodash/fp/head';
export const mapWithKey = map.convert({ cap: false });


const getYear = timestamp => timestamp.substr(0, 4);


export const standardizeSummaryMetadata =
  // Unroll the dict returned by backend `/multimeta` endpoint to an array.
  // Each array item has a unique combination of values for `unique_id`,
  // `variable_id`, and `variable_name`, unrolled from the dicts in the
  // original data, along with all the other properties that came with the
  // dict. Properties `start_date` and `end_date` are truncated to year only.
  // TODO: Convert date strings to Date objects instead?
  flow(
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


export function fetchSummaryMetadata() {
  // Fetch the summary metadata provided by the backend `/multimeta` endpoint.

  console.log('fetchSummaryMetadata()')
  const emissionsScenarios =
    process.env.REACT_APP_EMISSIONS_SCENARIOS.split(';');
  console.log('### emissionsScenarios', emissionsScenarios)
  return axios.get(
    urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'multimeta'),
    {
      params: {
        ensemble_name: process.env.REACT_APP_ENSEMBLE_NAME,
        model: process.env.REACT_APP_MODEL_ID,
      },
      transformResponse: [JSON.parse, standardizeSummaryMetadata],
    },
  )
  .then(response => response.data)
  .then(filter(
    metadatum =>  includes(metadatum.experiment, emissionsScenarios)
    // metadatum => metadatum.experiment === process.env.REACT_APP_EMISSIONS_SCENARIO
  ))
  .then(tap(metadata => {
    console.log('### Metadata loaded')
    console.log('### Models', groupBy('model_id')(metadata))
    console.log('### Scenario', groupBy('experiment')(metadata))
    console.log('### Variables', groupBy('variable_id')(metadata))
    console.log('### Run', groupBy('ensemble_member')(metadata))
    console.log('### Period', groupBy(m => `${m.start_date}-${m.end_date}`)(metadata))
    console.log('### Timescale', groupBy('timescale')(metadata))
  }))
}


export const normalizeFileMetadata =
  // Transform the unnecessarily nested dict returned by the backend
  // `/metadata` endpoint to an object one level shallower and with an
  // explicit name for the single top-level key (unique_id). This will have
  // to be done by any user of this information anyway, might as well do it
  // right here at the origin.
  flow(
    mapWithKey((content, unique_id) => ({
      unique_id,
      ...content,
    })),
    head,
  );

export function fetchFileMetadata(unique_id) {
  // Fetch the detailed metadata for a single file identified by `unique_id`
  // from the backend `/metadata` endpoint.

  return axios.get(
    urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'metadata'),
    {
      params: {
        // Note misleading naming: API param `model_id` should actually be
        // named `unique_id`.
        model_id: unique_id,
      },
      transformResponse: [JSON.parse, normalizeFileMetadata],
    },
  )
  .then(response => response.data)
}