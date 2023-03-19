import { WORDS } from '../build/words.js';

test('can load and test something', () => {
  expect(WORDS.length).toBeGreaterThan(0);
});
