export const regionId = region => {
  // Map frontend region specifier to region id used by the backend.
  const name = region.properties.english_na;
  switch (name) {
    case 'British Columbia': return 'bc';
    case 'Mount Waddington': return 'mt_waddington';
    default: return name.toLowerCase().replace(/\W+/g, '_');
  }
};


