export default [
  {
    variable: {
      label: 'Mean Temperature',
      units: '°C',
    },
    seasons: [
      {
        label: 'Annual',
        ensembleMedian: 1.8,
        range: { min: 1.3, max: 2.7, },
      },
    ]
  },

  {
    variable: {
      label: 'Precipitation',
      units: '%',
    },
    seasons: [
      {
        label: 'Annual',
        ensembleMedian: 6,
        range: { min: 2, max: 12, },
      },
      {
        label: 'Summer',
        ensembleMedian: -1,
        range: { min: -8, max: 6, },
      },
      {
        label: 'Winter',
        ensembleMedian: 8,
        range: { min: -2, max: 15, },
      },
    ]
  },

  {
    variable: {
      label: 'Snowfall',
      units: '%',
      derived: true,
    },
    seasons: [
      {
        label: 'Winter',
        ensembleMedian: -10,
        range: { min: -17, max: 2, },
      },
      {
        label: 'Spring',
        ensembleMedian: -58,
        range: { min: -71, max: -14, },
      },
    ]
  },

  {
    variable: {
      label: 'Growing Degree Days',
      units: 'degree days',
      derived: true,
    },
    seasons: [
      {
        label: 'Annual',
        ensembleMedian: 283,
        range: { min: 179, max: 429, },
      },
    ]
  },

  {
    variable: {
      label: 'Heating Degree Days',
      units: 'degree days',
      derived: true,
    },
    seasons: [
      {
        label: 'Annual',
        ensembleMedian: -648,
        range: { min: -952, max: -459, },
      },
    ]
  },

  {
    variable: {
      label: 'Frost-Free Days',
      units: 'days',
      derived: true,
    },
    seasons: [
      {
        label: 'Annual',
        ensembleMedian: 20,
        range: { min: 12, max: 29, },
      },
    ]
  },
]