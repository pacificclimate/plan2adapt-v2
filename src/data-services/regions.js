import axios from 'axios';
import tap from 'lodash/fp/tap';
// TODO: Remove harcoded regions
import regions from '../assets/regions';


export function fetchRegions() {
  // Fetch GeoJSON describing BC regions.
// TODO: Remove harcoded regions
  return Promise.resolve(regions);
  console.log('### fetchRegions')
  return axios.get(
    process.env.REACT_APP_REGIONS_SERVICE_URL,
    {
      params: {
        version: '1.0.0',
        service: 'WFS',
        request: 'GetFeature',
        typeName: 'bc_regions:bc-regions-polygon',
        maxFeatures: 100,
        outputFormat: 'application/json',
      }
    }
  )
  .then(tap(response => {console.log('### fetchRegions: done')}))
  .then(response => response.data)
}
