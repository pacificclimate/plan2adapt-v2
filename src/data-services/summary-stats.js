import axios from 'axios';
import urljoin from 'url-join';
import { regionId } from '../utils/regions';
import { middleDecade } from '../utils/time-periods';
import { periodToTimescale } from '../utils/percentile-anomaly';

export const fetchSummaryStatistics = (
  region, timePeriod, variable, percentiles
) => {
  // Fetch the summary statistics for the given region, climatological time
  // period, variable, percentiles.
  // `region` is a feature object from the regions service
  // `timePeriod` is an object of the form {start_date, end_date}
  // `variable` is a string identifying the variable (e.g., 'tasmean')
  // `percentiles` is an array of percentile values to be computed across
  //    the ensemble
  // Returns a promise for the summary statistics data.
  return axios.get(
    urljoin(process.env.REACT_APP_CE_BACKEND_URL, 'percentileanomaly'),
    {
      params: {
        region: regionId(region),
        climatology: middleDecade(timePeriod),
        variable,
        percentile: percentiles.join(','),
        baseline_model: "PCIC_BLEND_v1",
        baseline_climatology: "8110"
      }
    }
  )
    .then(response => response.data);
};

// This mapping is used to translate season names to their respective indices in the CSV stats files.
// "Season" in this case refers to the row-mapping of the summary table,
// where annual entries will always have a timeidx of 0. 
const seasonToIndex = {
  'winter': 0,
  'spring': 1,
  'summer': 2,
  'fall': 3,
  'annual': 0
};


// Fetch and parse CSV data
export const fetchCsvStats = (region, variable, season) => {
  const csvUrl = urljoin(
    process.env.REACT_APP_STATS_URL,
    `${regionId(region)}.csv`
  );

  return axios.get(csvUrl)
    .then(response => {
      return parseCSV(response.data);
    })
    .then(data => {
      const meanEntry = data.find(row =>
        row.variable === variable &&
        row.model === "PCIC_BLEND_v1" &&
        row.timescale === periodToTimescale(season) &&
        parseInt(row.timeidx, 10) === seasonToIndex[season]
      );
      if (!meanEntry) {
        console.error(`No matching entry found for ${variable} in season ${season}`);
        return null;
      }
      return meanEntry.mean;
    })
    .catch(error => {
      console.error(`Error fetching or parsing CSV data from ${csvUrl} for ${variable}, season ${season}:`, error);
      return null;
    });
};

function parseCSV(data) {
  const lines = data.split('\n');
  const result = [];
  const headers = lines[0].split(',').map(header => header.trim());

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") {
      continue; // Skip empty lines to avoid parsing errors
    }
    const obj = {};
    const currentline = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j] && currentline[j].trim();
    }
    result.push(obj);
  }
  return result;
}
