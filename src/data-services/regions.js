export function fetchRegions() {
  // Fetch GeoJSON describing BC regions.
  const regionsUrl = window.env.REACT_APP_REGIONS_GEOJSON_URL;

  return fetch(regionsUrl).then((response) => {
    if (!response.ok) {
      throw new Error(
        `Failed to fetch regions: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  });
}
