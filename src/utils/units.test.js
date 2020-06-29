import each from 'jest-each';
import {
  collectionToCanonicalUnitsSpecs,
  groupToCanonicalUnitsSpecs,
  toCanonicalUnitSpec,
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
    [ 'full', unitsGroup.full ],

    // Defaults
    [ 'empty', { label: 'empty', scale: 1, offset: 0 } ],
    [ 'labelOnly', { label: unitsGroup.labelOnly.label, scale: 1, offset: 0 } ],
    [ 'scaleOnly', { label: 'scaleOnly', scale: unitsGroup.scaleOnly.scale, offset: 0 } ],
    [ 'offsetOnly', { label: 'offsetOnly', scale: 1, offset: unitsGroup.offsetOnly.offset } ],

    // Synonyms
    [ 'synLong', { ...unitsGroup.full, label: 'synLong' } ],
    [ 'synShort', { ...unitsGroup.full, label: 'synShort' } ],
    [ 'synClosure', { ...unitsGroup.full, label: 'synClosure' } ],

    // Scale shorthand
    [
      'scaleShorthand',
      {
        label: 'scaleShorthand',
        scale: unitsGroup.scaleShorthand,
        offset: 0
      } ,
    ],

    // Others
    [
      'synScaleShorthand',
      {
        label: 'synScaleShorthand',
        scale: unitsGroup.scaleShorthand,
        offset: 0
      } ,
    ],
  ]).test('for %p', (unitId, expected) => {
    expect(
      toCanonicalUnitSpec(unitsGroup, unitId, unitsGroup[unitId])
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
      m: { label: 'm', scale: 1, offset: 0 },
      cm: { label: 'cm', scale: 1/100, offset: 0 },
      centimetre: { label: 'centimetre', scale: 1/100, offset: 0 },
    },
    time: {
      s: { label: 's', scale: 1, offset: 0 },
      minute: { label: 'minute', scale: 60, offset: 0 },
      min:  { label: 'min', scale: 60, offset: 0 },
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


describe('groupToCanonicalUnitsSpecs', () => {
});


// describe('thing', () => {
//   each([
//   ]).test('test', (input, expected) => {
//     expect(thing(input)).toEqual(expected);
//   });
// });
//
//
// describe('thing', () => {
//   each([
//   ]).test('test', (input, expected) => {
//     expect(thing(input)).toEqual(expected);
//   });
// });


describe('thing', () => {
  each([
  ]).test('test', (input, expected) => {
    expect(thing(input)).toEqual(expected);
  });
});
