import each from 'jest-each';
import keys from 'lodash/fp/keys';
import {
  canonicalConversion, convertUnits, convertUnitsInGroup,
  findConversionGroup, fromBaseUnits, toBaseUnits
} from './variables-and-units';


const conversions = {
  'precipitation flux': {
    'mm/yr': 1,
    'mm/d': 365,
    'kg m-1 d-1': 'mm/d',
  },
  temperature: {
    degC: 1,
    '°C': 'degC',
    'degF': {
      scale: 0.55555,
      offset: -32 * 0.55555,
    },
    '°F': 'degF',
  }
};

const tGroup = conversions['temperature'];
const degFconversion = tGroup['degF'];


describe('findConversionGroup', () => {
  describe('existing units', () => {
    each([
      ['kg m-1 d-1'],
      ['mm/d'],
      ['mm/yr'],
      ['°C'],
    ]).test('for %s', (units) => {
      expect(keys(findConversionGroup(conversions, units))).toContain(units);
    });
  });
  describe('non-existent units', () => {
    each([
      ['bargle'],
      [undefined],
    ]).test('for %s', (units) => {
      expect(findConversionGroup(conversions, units)).toBeUndefined();
    });
  });
});


describe('canonicalConversion', () => {
  each([
    [1, { scale: 1, offset: 0 }],
    [2, { scale: 2, offset: 0 }],
    [{ scale: 3, offset: 4 }, { scale: 3, offset: 4 }],
  ]).test('for %p', (input, expected) => {
    expect(canonicalConversion(input)).toEqual(expected);
  });
});


describe('toBaseUnits', () => {
  each([
    [1, 0, 2, 2],
    [1, 1, 2, 3],
    [10, 1, 2, 21],
    [degFconversion.scale, degFconversion.offset, 50, 10],
  ]).it('scale: %d, offset: %d, value: %d', (scale, offset, value, expected) => {
    expect(toBaseUnits({scale, offset}, value)).toBeCloseTo(expected);
  });
});


describe('fromBaseUnits', () => {
  each([
    [1, 0, 2, 2],
    [1, 1, 3, 2],
    [10, 1, 21, 2],
    [degFconversion.scale, degFconversion.offset, 10, 50],
  ]).it('scale: %d, offset: %d, value: %d', (scale, offset, value, expected) => {
    expect(fromBaseUnits({scale, offset}, value)).toBeCloseTo(expected);
  });
});


describe('compose toBaseUnits, fromBaseUnits', () => {
  each([
    [1, 0, 2],
    [1, 1, 3],
    [10, 1, 4],
  ]).it('scale: %d, offset: %d, value: %d', (scale, offset, value) => {
    const conversion = {scale, offset};
    expect(fromBaseUnits(conversion, toBaseUnits(conversion, value)))
      .toBeCloseTo(value);
    expect(toBaseUnits(conversion, fromBaseUnits(conversion, value)))
      .toBeCloseTo(value);
  });
});


describe('convertUnitsInGroup', () => {
  each([
    [3, 'degC', 3, 'degC', tGroup],
    [4, 'degC', 4, '°C', tGroup],
    [5, '°C', 5, 'degC', tGroup],
    [10, 'degC', 50, 'degF', tGroup],
    [10, '°C', 50, 'degF', tGroup],
    [50, 'degF', 10, 'degC', tGroup],
    [50, '°F', 10, 'degC', tGroup],
    [50, '°F', 10, '°C', tGroup],
  ]).it('%d %s = %d %s', (value, fromUnits, expected, toUnits, group) => {
    expect(convertUnitsInGroup(group, fromUnits, toUnits, value))
      .toBeCloseTo(expected);
  });
});


describe('convertUnits', () => {
  each([
    [3, 'degC', 3, 'degC', conversions],
    [4, 'degC', 4, '°C', conversions],
    [5, '°C', 5, 'degC', conversions],
    [10, 'degC', 50, 'degF', conversions],
    [10, '°C', 50, 'degF', conversions],
    [50, 'degF', 10, 'degC', conversions],
    [50, '°F', 10, 'degC', conversions],
    [50, '°F', 10, '°C', conversions],
    [5, 'kg m-1 d-1', 5, 'mm/d', conversions],
    [5, 'mm/d', 5 * 365, 'mm/yr', conversions],
  ]).test('%d %s = %d %s', (value, fromUnits, expected, toUnits, conversions) => {
    expect(convertUnits(conversions, fromUnits, toUnits, value))
    .toBeCloseTo(expected);     
  });
});
