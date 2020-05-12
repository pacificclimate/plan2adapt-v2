import each from 'jest-each';
import {
  byLines,
  internalQuoteRecoding,
  recodeInternalQuotes,
  restoreInternalQuotes,
  internalSemiRecoding,
  recodeInternalSemis,
  restoreInternalSemis,
  quoteUnquotedCols,
  byLinesThenColumns,
  linesAsObjects,
} from './rulebase';
import { flow, filter, map, mapValues, uniq, sortBy, groupBy } from 'lodash/fp';
const sort = sortBy(x => x);


test('byLines', () => {
  console.log(byLines);
});


describe('recodeInternalQuotes', () => {
  each([
    // [';"";', `;"";`],
    [';"foo""bar";',
      `;"foo${internalQuoteRecoding}bar";`],
    [';"foo""bar""baz";',
      `;"foo${internalQuoteRecoding}bar${internalQuoteRecoding}baz";`],
    [';"foo""bar";"baz""qux";',
      `;"foo${internalQuoteRecoding}bar";"baz${internalQuoteRecoding}qux";`],
  ]).test('on input %s', (input, output) => {
    expect(recodeInternalQuotes(input)).toBe(output);
  });
});


describe('restoreInternalQuotes', () => {
  each([
    [`;"foo${internalQuoteRecoding}bar";`,
      ';"foo"bar";'],
    [`;"foo${internalQuoteRecoding}bar${internalQuoteRecoding}baz";`,
      ';"foo"bar"baz";'],
    [`;"foo${internalQuoteRecoding}bar";"baz${internalQuoteRecoding}qux";`,
      ';"foo"bar";"baz"qux";'],
  ]).test('on input %s', (input, output) => {
    expect(restoreInternalQuotes(input)).toBe(output);
  });
});


describe('recodeInternalSemis', () => {
  each([
    [';;', `;;`],
    [';";";', `;"${internalSemiRecoding}";`],
    [';"foo;bar";',
      `;"foo${internalSemiRecoding}bar";`],
    [';"foo;bar;baz";',
      `;"foo${internalSemiRecoding}bar${internalSemiRecoding}baz";`],
    [';"foo;bar";"baz;qux";',
      `;"foo${internalSemiRecoding}bar";"baz${internalSemiRecoding}qux";`],
  ]).test('on input %s', (input, output) => {
    expect(recodeInternalSemis(input)).toBe(output);
  });
});


describe('quoteUnquotedCols', () => {
  each([
    [';', '"";""'],
    ['"first";', '"first";""'],
    [';"second"', '"";"second"'],
    ['"first";"second"', '"first";"second"'],
    [';;', '"";"";""'],
    [';"second";', '"";"second";""'],
    [';1;2;', '"";"1";"2";""'],
    // Explicitly exclude case with semicolon(s) inside quotes.
    // This is handled by recoding internal semicolons.
  ]).test('on input %s', (input, output) => {
    expect(quoteUnquotedCols(input)).toBe(output);
  });
});


describe('byLinesThenColumns', () => {
  test('print all', () => {
    console.log(
      (map(line => line.join('\t'))(byLinesThenColumns)).join('\n')
    )
  });
});

describe('linesAsObjects', () => {
  test('print all', () => {
    console.log(linesAsObjects);
  });

  test('categories', () => {
    const categories = uniq(map(line => line.category)(linesAsObjects));
    console.log(sort(categories));
  });

  test('sectors', () => {
    const sectors = uniq(map(line => line.sector)(linesAsObjects));
    console.log(sort(sectors));
  });

  test('effects', () => {
    const effects = uniq(map(line => line.effects)(linesAsObjects));
    console.log(sort(effects));
  });

  test('group by category', () => {
    const objectsByCategory = groupBy(line => line.category)(linesAsObjects);
    const sectorsByCategory =
      mapValues(
        flow(
          map(rule => rule.sector),
          uniq,
          sort,
        )
      )(objectsByCategory);
    console.log(sectorsByCategory);
  });
});

