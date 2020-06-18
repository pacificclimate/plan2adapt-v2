import map from 'lodash/fp/map';


export const simpleSelectorOptions = map(
  value => ({ label: value.toString(), value })
);
