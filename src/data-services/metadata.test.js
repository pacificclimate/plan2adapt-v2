import { standardizeSummaryMetadata, normalizeFileMetadata } from './metadata';
import sortBy from 'lodash/fp/sortBy';


const rest = i => ({
  x: `x${i}`,
  y: `y${i}`,
});

describe('standardizeSummaryMetadata', () => {
  const year = (i, j) => `2${i}0${j}`;
  const years = i => ({
    start_date: year(i, 1),
    end_date: year(i, 2),
  });
  const timestamp = (i, j) => `${year(i,j)}-foobar`;
  const timestamps = i => ({
    start_date: timestamp(i, 1),
    end_date: timestamp(i, 2),
  });

  const data = {
    uid1: {
      ...rest(1),
      ...timestamps(1),
      variables: {
        vid1: 'vname1',
      }
    },
    uid2: {
      ...rest(2),
      ...timestamps(2),
      variables: {
        vid1: 'vname1',
        vid2: 'vname2',
      }
    },
  };

  const normalized = [
    {
      unique_id: 'uid1',
      ...rest(1),
      ...years(1),
      variable_id: 'vid1',
      variable_name: 'vname1',
    },
    {
      unique_id: 'uid2',
      ...rest(2),
      ...years(2),
      variable_id: 'vid1',
      variable_name: 'vname1',
    },
    {
      unique_id: 'uid2',
      ...rest(2),
      ...years(2),
      variable_id: 'vid2',
      variable_name: 'vname2',
    },
  ];

  it('works', () => {
    expect(sortBy('unique_id')(standardizeSummaryMetadata(data))).toEqual(normalized);
  });
});


describe('normalizeFileMetadata', () => {
  const data = {
    giraffe_elephant: {
      ...rest(1)
    }
  };

  const normalized = {
    unique_id: 'giraffe_elephant',
    ...rest(1)
  };

  it('works', () => {
    expect(normalizeFileMetadata(data)).toEqual(normalized);
  });
});
