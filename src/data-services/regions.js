import axios from 'axios';


export function fetchRegions() {
  // Fetch GeoJSON describing BC regions.
  return axios.get(
    process.env.REACT_APP_REGIONS_SERVICE_URL,
    {
      params: {
        version: '1.0.0',
        service: 'WFS',
        request: 'GetFeature',
        typeName: 'bc_regions:bc-regions-polygon-test',
        maxFeatures: 100,
        outputFormat: 'application/json',
      }
    }
  )
    .then(response => response.data)
}
