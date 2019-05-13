import { textToImageFilename } from '../ImpactIcon';


describe('textToImageFilename', () => {
  it('works', () => {
    expect(textToImageFilename('Able Baker/Charlie, Whassup!'))
    .toBe('able_baker_charlie_whassup_');
  });
});