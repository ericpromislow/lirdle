import * as perturb from '../build/perturb.js';

describe('perturbation tests', () => {
    describe('finds contractions', () => {
        describe('with some vars', () => {
            const guessWord = 'ghijk';
            const scores = [1, 0, 0, 0, 0];
            test('finds no contradiction when no greens have been found', () => {
                const greenLettersByPosition = [];
                const directive = [0, 1];
                expect(perturb.scoreContradiction(guessWord, scores, greenLettersByPosition, directive)).toBe(0);
            });
            test('finds no contradictions with other greens', () => {
                const greenLettersByPosition = ['', 'n', 'm', 'p', 'pq'];
                const directive = [0, 1];
                expect(perturb.scoreContradiction(guessWord, scores, greenLettersByPosition, directive)).toBe(0);
            });
            test("doesn't care about black scores right now", () => {
                const greenLettersByPosition = ['ghi', 'm', 'n', 'p', 'pq'];
                const directive = [0, -1];
                expect(perturb.scoreContradiction(guessWord, scores, greenLettersByPosition, directive)).toBe(0);
            });
            test("doesn't care about yellow scores right now", () => {
                const greenLettersByPosition =  ['ghi', 'm', 'n', 'p', 'pq'];
                const directive = [1, 1];
                expect(perturb.scoreContradiction(guessWord, scores, greenLettersByPosition, directive)).toBe(0);
            });
            test('finds a level-1 contradiction', () => {
                const greenLettersByPosition = ['m'];
                const directive = [0, 1];
                expect(perturb.scoreContradiction(guessWord, scores, greenLettersByPosition, directive)).toBe(5);
            });
            test('finds a level-1 contradiction', () => {
                const greenLettersByPosition = ['mn'];
                const directive = [0, 1];
                expect(perturb.scoreContradiction(guessWord, scores, greenLettersByPosition, directive)).toBe(7);
            });
            test('finds a level-2 contradiction', () => {
                const greenLettersByPosition = ['mno'];
                const directive = [0, 1];
                expect(perturb.scoreContradiction(guessWord, scores, greenLettersByPosition, directive)).toBe(9);
            });
            test('and there are no higher-level contradictions', () => {
                const greenLettersByPosition = ['mnop'];
                const directive = [0, 1];
                expect(perturb.scoreContradiction(guessWord, scores, greenLettersByPosition, directive)).toBe(9);
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
            const greenLettersByPosition = ['m'];
            let numGreenGs = 0;
            let numBlackGs = 0;
            for (let i = 0; i < 1000; i++) {
                const [posn, direction] = perturb.perturb(guessWord, scores, greenLettersByPosition);
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
            const greenLettersByPosition = ['mn'];
            let numGreenGs = 0;
            let numBlackGs = 0;
            for (let i = 0; i < 1000; i++) {
                const [posn, direction] = perturb.perturb(guessWord, scores, greenLettersByPosition);
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
            const greenLettersByPosition = ['mno'];
            let numGreenGs = 0;
            let numBlackGs = 0;
            const t1 = new Date().valueOf();
            for (let i = 0; i < 10000; i++) {
                const [posn, direction] = perturb.perturb(guessWord, scores, greenLettersByPosition);
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
    });
});