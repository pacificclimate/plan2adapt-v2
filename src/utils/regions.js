export const regionId = (region, group) => {
  // Map frontend region specifier to region id used by the backend.
  const name = region.properties.english_na;
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
      return `kootenay_boundary_FR'`;
    }
    default:
      return name.toLowerCase().replace(/\W+/g, '_');
  }
};


