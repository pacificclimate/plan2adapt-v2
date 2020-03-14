// Convert a standard {start_date, end_date} climatological time period
// specifier to the middle decade of the period, rounded to a multiple of 10.
// E.g., {start_date: 2010, end_date: 2039} -> 2020
// Accepts anything interpretable as numbers; returns a number.
export const middleDecade = ({start_date, end_date}) =>
  Math.floor((Number(start_date) + Number(end_date)) / 20 ) * 10