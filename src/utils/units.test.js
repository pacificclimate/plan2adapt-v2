import each from 'jest-each';
import {
  collectionToCanonicalUnitsSpecs,
  groupToCanonicalUnitsSpecs,
  toCanonicalUnitSpec,
  convertUnitsInGroup,
  fromBaseUnits,
  toBaseUnits,
} from './units';


describe('toCanonicalUnitSpec', () => {
  const unitsGroup = {
    // Full spec
    full: {
      label: 'lleno',
      scale: 42,
      offset: 99,
    },

    // To test defaults
    empty: {},
    labelOnly: { label: 'foo' },
    scaleOnly: { scale: 7 },
    offsetOnly: { offset: 17 },

    // To test synonyms
    synLong: { synonymFor: 'full' },
    synShort: 'full',
    synClosure: 'synShort',

    // To test scale shorthand
    scaleShorthand: 22,

    // An extra combination or two
    synScaleShorthand: 'scaleShorthand',
  };

  each([
    // Full
    ['full', { id: 'full', ...unitsGroup.full }],

    // Defaults
    ['empty', { id: 'empty', label: 'empty', scale: 1, offset: 0 }],
    [
      'labelOnly',
      {
        id: 'labelOnly',
        label: unitsGroup.labelOnly.label,
        scale: 1,
        offset: 0
      }
    ],
    [
      'scaleOnly',
      {
        id: 'scaleOnly',
        label: 'scaleOnly',
        scale: unitsGroup.scaleOnly.scale,
        offset: 0
      }
    ],
    [
      'offsetOnly',
      {
        id: 'offsetOnly',
        label: 'offsetOnly',
        scale: 1,
        offset: unitsGroup.offsetOnly.offset
      }
    ],

    // Synonyms
    ['synLong', { ...unitsGroup.full, id: 'synLong', label: 'synLong' }],
    ['synShort', { ...unitsGroup.full, id: 'synShort', label: 'synShort' }],
    [
      'synClosure',
      {
        ...unitsGroup.full,
        id: 'synClosure',
        label: 'synClosure'
      }],

    // Scale shorthand
    [
      'scaleShorthand',
      {
        id: 'scaleShorthand',
        label: 'scaleShorthand',
        scale: unitsGroup.scaleShorthand,
        offset: 0
      },
    ],

    // Others
    [
      'synScaleShorthand',
      {
        id: 'synScaleShorthand',
        label: 'synScaleShorthand',
        scale: unitsGroup.scaleShorthand,
        offset: 0
      } ,
    ],
  ]).test('for %p', (unitId, expected) => {
    expect(
      toCanonicalUnitSpec(unitsGroup, unitId)
    ).toEqual(expected);
  });
});


describe('mappers', () => {
  const inputCollection = {
    length: {
      m: 1,
      cm: 1 / 100,
      centimetre: 'cm',
    },
    time: {
      s: 1,
      minute: 60,
      min: 'minute',
    },
  };

  const expectedCollection = {
    length: {
      m: { id: 'm', label: 'm', scale: 1, offset: 0 },
      cm: { id: 'cm', label: 'cm', scale: 1/100, offset: 0 },
      centimetre: { id: 'centimetre', label: 'centimetre', scale: 1/100, offset: 0 },
    },
    time: {
      s: { id: 's', label: 's', scale: 1, offset: 0 },
      minute: { id: 'minute',label: 'minute', scale: 60, offset: 0 },
      min:  { id: 'min', label: 'min', scale: 60, offset: 0 },
    },
  };

  test('groupToCanonicalUnitsSpecs', () => {
    expect(groupToCanonicalUnitsSpecs(inputCollection.length))
      .toEqual(expectedCollection.length);
  });

  test('collectionToCanonicalUnitsSpecs', () => {
    expect(collectionToCanonicalUnitsSpecs(inputCollection))
      .toEqual(expectedCollection);
  });
});


describe('value conversions', () => {
  const collection = collectionToCanonicalUnitsSpecs({
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
  });

  const tGroup = collection['temperature'];
  const degFconversion = tGroup['degF'];


  describe('toBaseUnits', () => {
    each([
      [1, 0, 2, 2],
      [1, 1, 2, 3],
      [10, 1, 2, 21],
      [degFconversion.scale, degFconversion.offset, 50, 10],
    ]).it('scale: %d, offset: %d, value: %d', (scale, offset, value, expected) => {
      expect(toBaseUnits({ scale, offset }, value)).toBeCloseTo(expected);
    });
  });

  describe('fromBaseUnits', () => {
    each([
      [1, 0, 2, 2],
      [1, 1, 3, 2],
      [10, 1, 21, 2],
      [degFconversion.scale, degFconversion.offset, 10, 50],
    ]).it('scale: %d, offset: %d, value: %d', (scale, offset, value, expected) => {
      expect(fromBaseUnits({ scale, offset }, value)).toBeCloseTo(expected);
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
});
