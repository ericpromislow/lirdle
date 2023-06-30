import * as perturb from '../build/perturb.js';

describe('perturbation tests', () => {
    describe('finds contractions', () => {
        describe('with some vars', () => {
            const guessWord = 'ghijk';
            const scores = [1, 0, 0, 0, 0];
            test('finds no contradiction when no greens have been found', () => {
                const lettersByPosition = {};
                const directive = [0, 1];
                expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive)).toBe(0);
            });
            test('finds no contradictions with other greens', () => {
                const lettersByPosition = { green: ['', 'n', 'm', 'p', 'pq']};
                const directive = [0, 1];
                expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive)).toBe(0);
            });
            test("doesn't care about black scores right now", () => {
                const lettersByPosition = { green: ['ghi', 'm', 'n', 'p', 'pq'] };
                const directive = [0, -1];
                expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive)).toBe(0);
            });
            test("doesn't care about yellow scores right now", () => {
                const lettersByPosition = { green: ['ghi', 'm', 'n', 'p', 'pq'] };
                const directive = [1, 1];
                expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive)).toBe(0);
            });
            test('finds a level-1 contradiction', () => {
                const lettersByPosition = { green: ['m'] };
                const directive = [0, 1];
                const val = perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive);
                expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive)).toBe(3);
            });
            test('finds a level-1 contradiction with two letters', () => {
                const lettersByPosition = { green: ['mn'] };
                const directive = [0, 1];
                expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive)).toBe(7);
            });
            test('finds a level-2 contradiction', () => {
                const lettersByPosition = { green: ['mno'] };
                const directive = [0, 1];
                expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive)).toBe(9);
            });
            test('and there are no higher-level contradictions', () => {
                const lettersByPosition = { green: ['mnop'] };
                const directive = [0, 1];
                expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive)).toBe(9);
            });
        });
    });
    describe('avoiding contradictions', () => {
        const guessWord = 'ghijk';
        const scores = [1, 0, 0, 0, 0];
        test('with one letter in green', () => {
            // 9 out of 10 times the first hit is ok
            // for the one contradiction, we have 10 * 9 hits, and 5 for the contradiction.
            // So we'll see a green in posn 1 about 5/950 ~= 1 out of 200 times
            const lettersByPosition = { green: ['m'] };
            let numGreenGs = 0;
            let numBlackGs = 0;
            for (let i = 0; i < 1000; i++) {
                const [posn, direction] = perturb.perturb(guessWord, scores, lettersByPosition);
                if (posn === 0) {
                    if (direction === 1) {
                        numGreenGs += 1;
                    } else {
                        numBlackGs += 1;
                    }
                }
            }
            console.log(`numGreenGs: ${ numGreenGs }, numBlackGs: ${ numBlackGs }`)
            expect(numGreenGs).toBeGreaterThan(0);
            expect(numGreenGs).toBeLessThan(20);
            expect(numBlackGs).toBeGreaterThan(66);
            expect(numBlackGs).toBeLessThan(133);
        });
        test('with two letters in green', () => {
            // 9 out of 10 times the first hit is ok
            // for the one contradiction, we have 10 * 9 hits, and 5 for the contradiction.
            // So we'll see a green in posn 1 about 5/950 ~= 1 out of 200 times
            const lettersByPosition = { green: ['mn'] };
            let numGreenGs = 0;
            let numBlackGs = 0;
            for (let i = 0; i < 1000; i++) {
                const [posn, direction] = perturb.perturb(guessWord, scores, lettersByPosition);
                if (posn === 0) {
                    if (direction === 1) {
                        numGreenGs += 1;
                    } else {
                        numBlackGs += 1;
                    }
                }
            }
            console.log(`numGreenGs: ${ numGreenGs }, numBlackGs: ${ numBlackGs }`)
            expect(numGreenGs).toBeGreaterThan(0);
            expect(numGreenGs).toBeLessThan(10);
            expect(numBlackGs).toBeGreaterThan(66);
            expect(numBlackGs).toBeLessThan(133);
        });
        test('with three letters in green', () => {
            // 9 out of 10 times the first hit is ok
            // for the one contradiction, we have 10 * 9 hits, and 5 for the contradiction.
            // So we'll see a green in posn 1 about 1/950 ~= 1 out of 1000 times
            const lettersByPosition = { green: ['mno'] };
            let numGreenGs = 0;
            let numBlackGs = 0;
            const t1 = new Date().valueOf();
            for (let i = 0; i < 10000; i++) {
                const [posn, direction] = perturb.perturb(guessWord, scores, lettersByPosition);
                if (posn === 0) {
                    if (direction === 1) {
                        numGreenGs += 1;
                    } else {
                        numBlackGs += 1;
                    }
                }
            }
            const t2 = new Date().valueOf();
            console.log(`delta: ${ (t2 - t1)  } msec; numGreenGs: ${ numGreenGs }, numBlackGs: ${ numBlackGs }`)
            // console.log(`delta: ${ 1000 * (t2 - t1) / 10000  } microsec/op`)
            expect(numGreenGs).toBeGreaterThan(0);
            expect(numGreenGs).toBeLessThan(20);
            expect(numBlackGs).toBeGreaterThan(666);
            expect(numBlackGs).toBeLessThan(1333);
        });
        describe('black and yellow', () => {
            const guessWord = 'ghijk';
            const scores = [1, 0, 0, 0, 0];
            test('with one char as yellow', () => {
                const lettersByPosition = {yellow: {g: 1}};
                const directive = [0, -1];
                expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive)).toBe(1);
            });
            test('with one char as black', () => {
                const lettersByPosition = {black: { h: 1}};
                const directive = [1, 1];
                expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive)).toBe(1);
            });
            test('with both chars present favoring the other', () => {
                const lettersByPosition = {black: { h: 7 }, yellow: { h: 3 }};
                const directive = [1, 1];
                expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive)).toBe(4);
            });
            test('with both chars present favoring the lie', () => {
                const lettersByPosition = {black: { h: 3 }, yellow: { h: 7 }};
                const directive = [1, 1];
                expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, directive)).toBe(0);
            });
            test('with one yellow and one black', () => {
                const guessWord = 'ghijk';
                const scores = [1, 0, 0, 0, 0];
                // for every 82 runs, we expect 1 black-g and 1 yellow-h
                const lettersByPosition = { yellow: { g: 9 }, black: { h: 9 } };
                let numBlackGs = 0;
                let numYellowHs = 0;
                let numOthers = 0;
                // const hits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                const lim = 82000;
                for (let i = 0; i < lim; i++) {
                    const [posn, direction] = perturb.perturb(guessWord, scores, lettersByPosition);
                    // const idx = 2 * posn + (direction === -1 ? 0 : 1);
                    // hits[idx] += 1;
                    if (posn === 0 && direction === -1) {
                        numBlackGs += 1;
                    } else if (posn === 1 && direction === 1) {
                        numYellowHs += 1;
                    } else {
                        numOthers += 1;
                    }
                }
                // console.log('hits:', hits);
                // console.log(`numBlackGs: ${ numBlackGs }, numYellowHs: ${ numYellowHs }`)
                // I would expect these to be more around lim / 82 -> 1000, but no they're more around 200
                expect(numBlackGs).toBeGreaterThan(100);
                expect(numBlackGs).toBeLessThan(2000);
                expect(numYellowHs).toBeGreaterThan(100);
                expect(numYellowHs).toBeLessThan(2000);
            });
        });
    });
    describe('duplicate words', () => {
        test('favors greens over duplicate assignments', () => {
            const guessWord = 'abcde';
            const scores = [1, 0, 0, 0, 0]
            const lettersByPosition = {
                green: ['a'],
                assignments: {abcde: [[0, -1], [1, -1], [1, 1], [2, -1], [2, 1], [3, -1], [3, 1], [4, -1], [4, 1]]},
            };
            // The only assignment for 'abcde' we haven't seen yet is [0, +1], but we should still pick 7 of them
            // and 1 of the other 9, so odds of picking it are 7/(7 + 9) => 7/16
            let greenAt0 = 0;
            let otherDirective = 0;
            const lim = 1000;
            for (let i = 0; i < lim; i++) {
                const [posn, direction] = perturb.perturb(guessWord, scores, lettersByPosition);
                // console.log(`Run ${i}: posn:${posn}, direction:${ direction }`);
                if (posn === 0 && direction === 1) {
                    greenAt0 += 1;
                } else {
                    otherDirective += 1;
                }
            }
            // console.log(`greenAt0: ${ greenAt0 }, numBlackGs: ${ otherDirective }`)
            // picking 7 green "a"s and 9 others
            expect(greenAt0).toBeGreaterThan((5.0 * lim) / 16);
            expect(greenAt0).toBeLessThan((9.5 * lim) / 16);
        });
        test("ignores duplicate words when they're all in use", () => {
            const guessWord = 'abcde';
            const scores = [1, 0, 0, 0, 0]
            const lettersByPosition = {
                green: ['x'],
                assignments: {abcde: [[0, -1], [0, 1], [1, -1], [1, 1], [2, -1], [2, 1], [3, -1], [3, 1], [4, -1], [4, 1]]},
            };
            let greenAt0 = 0;
            let otherDirective = 0;
            for (let i = 0; i < 1000; i++) {
                const [posn, direction] = perturb.perturb(guessWord, scores, lettersByPosition);
                // console.log(`Run ${i}: posn:${posn}, direction:${ direction }`);
                if (posn === 0 && direction === 1) {
                    greenAt0 += 1;
                } else {
                    otherDirective += 1;
                }
            }
            // console.log(`greenAt0: ${ greenAt0 }, numBlackGs: ${ otherDirective }`)
            expect(greenAt0).toBeGreaterThan(66);
            expect(greenAt0).toBeLessThan(134);
        });
    });
    describe('fetus bug', () => {
        test("shouldn't repeat the result for a duplicate word", () => {
            const soFar = [
                ['waltz', [3, -1]],
                ['fjord', [0,-1]],
                ['nymph', [0,1]],
                ['quick', [4,1]],
                ['boxes', [3,1]],
                ['sleek', [1,1]],
                ['unpeg', [2,-1]],
                ['stunk', [1,1]],
                ['utter', [0,1]]
            ];
            const guessWord = 'utter';
            const scores = [1, 1, 1, 0, 0];
            const lettersByPosition = {
                green: ['','t','pt','e','s'],
                assignments: { utter: [[0, -1]] },
            };
            expect(perturb.scoreContradiction(guessWord, scores, lettersByPosition, [0, -1])).toEqual(9);
        })
    });
});