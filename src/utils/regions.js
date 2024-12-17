export const regionId = (region) => {


  // Map frontend region specifier to region id used by the backend.
  const name = region.properties.english_na;
  const group = region.properties.group
  switch (name) {
    case 'British Columbia': return 'bc';
    case 'Mount Waddington': return 'mt_waddington';
    case 'Oweek’ala': return 'oweekala';
    case 'Lake Babine Nadot’en': return 'lake_babine_nadoten';
    case 'Babine-Witsuwit\'en': return 'babine-witsuwiten';
    case 'Cariboo': if (group === 'Forestry Regions') {
      return `${name.toLowerCase().replace(/\W+/g, '_')}_FR`;
    }
    case 'Kootenay / Boundary': if (group === 'Forestry Regions') {
      return 'kootenay_boundary_FR';
    }
    default:
      return name.toLowerCase().replace(/\W+/g, '_');
  }
};


export const regionalAssessmentRegions = {
  "bc": "British Columbia",
  "alberni_clayoquot": "Alberni-Clayoquot",
  "boreal_plains": "Boreal Plains",
  "bulkley_nechako": "Bulkley-Nechako",
  "capital": "Capital",
  "cariboo": "Cariboo",
  "central_coast": "Central Coast",
  "central_kootenay": "Central Kootenay",
  "central_okanagan": "Central Okanagan",
  "columbia_shuswap": "Columbia-Shuswap",
  "comox_valley": "Comox Valley",
  "cowichan_valley": "Cowichan Valley",
  "east_kootenay": "East Kootenay",
  "fraser_fort_george": "Fraser-Fort George",
  "fraser_valley": "Fraser Valley",
  "greater_vancouver": "Greater Vancouver",
  "kitimat_stikine": "Kitimat-Stikine",
  "kootenay_boundary": "Kootenay Boundary",
  "mt_waddington": "Mount Waddington",
  "nanaimo": "Nanaimo",
  "northern_rockies": "Northern Rockies",
  "north_okanagan": "North Okanagan",
  "okanagan_similkameen": "Okanagan-Similkameen",
  "peace_river": "Peace River",
  "powell_river": "Powell River",
  "skeena_queen_charlotte": "Skeena-Queen Charlotte",
  "squamish_lillooet": "Squamish-Lillooet",
  "stikine": "Stikine",
  "strathcona": "Strathcona",
  "sunshine_coast": "Sunshine Coast",
  "thompson_nicola": "Thompson-Nicola",
  "interior": "Interior",
  "northern": "Northern",
  "vancouver_coast": "Vancouver Coast",
  "vancouver_fraser": "Vancouver Fraser",
  "vancouver_island": "Vancouver Island",
  "central_interior": "Central Interior",
  "coast_and_mountains": "Coast and Mountains",
  "georgia_depression": "Georgia Depression",
  "northern_boreal_mountains": "Northern Boreal Mountains",
  "southern_interior": "Southern Interior",
  "southern_interior_mountains": "Southern Interior Mountains",
  "sub_boreal_mountains": "Sub Boreal Mountains",
  "taiga_plains": "Taiga Plains",
  "cariboo": "Cariboo",
  "kootenay_/_boundary": "Kootenay / Boundary",
  "northeast": "Northeast",
  "omineca": "Omineca",
  "skeena": "Skeena",
  "south_coast": "South Coast",
  "thompson_okanagan": "Thompson / Okanagan",
  "west_coast": "West Coast",
  "vic_test": "Vic Test",
  "algonquian": "Algonquian",
  "athabaskan-eyak-tlingit": "Athabaskan-Eyak-Tlingit",
  "coast_salish": "Coast Salish",
  "haida": "Haida",
  "interior_salish": "Interior Salish",
  "ktunaxa": "Ktunaxa",
  "tsimshianic": "Tsimshianic",
  "wakashan": "Wakashan",
};
