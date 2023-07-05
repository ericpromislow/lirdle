import { evalPossibleWords, evaluateGuess, getSolverData, scoreMakesSense, updateSolver } from "../build/solver.js";
import { WORDS } from "../build/words";

describe('solver tests', () => {
    describe('evaluate guess', () => {
        test('can handle duplicate letters', () => {
            expect(evaluateGuess('abhor', 'parer')).toEqual([0, 1, 0, 0, 2]);
            expect(evaluateGuess('mamma', 'amima')).toEqual([1, 1, 0, 2, 2]);
        })
    })
    describe('reduced word list', () => {
        const currentWordList = ['taste', 'waste', 'wedge', 'llama', 'mango'];
        describe('evalPossibleWords', () => {
            test('green i should fail', () => {
                expect(evalPossibleWords('rinse', [1, 2, 1, 1, 0], currentWordList)).toEqual([]);
            });
            test('s, e are green but the a is black', () => {
                let words = evalPossibleWords('basge', [0, 0, 2, 0, 2], currentWordList);
                expect(words).toEqual(['taste', 'waste']);
                words = evalPossibleWords('basue', [0, 0, 2, 0, 2], currentWordList);
                expect(words).toEqual(['taste', 'waste', 'wedge']);
            });
            test('only an l and an m', () => {
                let words = evalPossibleWords('xmgle', [0, 1, 1, 1, 0], currentWordList);
                expect(words).toEqual(['llama', 'mango']);
            });
        });
        describe('updateSolver', () => {
            const solverData = getSolverData();
            const guesses = [];
            const scores = [];
            solverData.possibleWords = currentWordList;
            test('follow through 4 lines', () => {
                updateSolver(guesses,scores, solverData);
                expect(solverData.level).toBe(0);
                expect(solverData).toEqual({
                    level: 0,
                    possibleWords: currentWordList,
                    possibleWordCounts: [],
                });
                // ['taste', 'waste', 'wedge', 'llama', 'mango'];

                guesses.push('quick');
                scores.push([2, 0, 0, 0, 0]);
                updateSolver(guesses,scores, solverData);
                expect(solverData).toEqual({
                    level: 1,
                    possibleWords: currentWordList,
                    possibleWordCounts: [currentWordList.length],
                });
                expect(solverData.level).toBe(1);
                expect(solverData.possibleWords.length).toBe(currentWordList.length);

                guesses.push('fixqa');
                scores.push([0, 0, 0, 0, 0]);
                updateSolver(guesses,scores, solverData);
                expect(solverData).toEqual({
                    level: 2,
                    possibleWords: ['taste', 'waste', 'llama', 'mango'],
                    possibleWordCounts: [5, 4],
                });

                guesses.push('abmdc');
                scores.push([0, 0, 1, 0, 0]);
                updateSolver(guesses,scores, solverData);
                expect(solverData).toEqual({
                    level: 3,
                    possibleWords: ['llama', 'mango'],
                    possibleWordCounts: [5, 4, 2],
                });

                guesses.push('alarm');
                scores.push([1, 1, 2, 0, 1]);
                updateSolver(guesses,scores, solverData);
                expect(solverData).toEqual({
                    level: 4,
                    possibleWords: ['llama'],
                    possibleWordCounts: [5, 4, 2, 1],
                });
            });
        });
    });
    describe('smaller word list', () => {
        const currentWordList = ['abhor', 'urban'];
        describe('abhor/parer bug', () => {
            test('abhor parer test 1', () => {
                const scores = evaluateGuess('abhor', 'parer');
                expect(scores).toEqual([0, 1, 0, 0, 2]);
                const wordList2 = evalPossibleWords('parer', [0, 0, 1, 0, 0], currentWordList)
                expect(wordList2).toEqual(['urban']);
            });
            it('loops through', () => {
                const scores = [0, 1, 1, 0, 0];
                console.log(`-scoreMakesSense 'parer', 'abhor', ${scores.join(',')}, }`);
                expect(scoreMakesSense('parer', 'abhor', scores)).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,0,0,0])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,0,0,1])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,0,0,2])).toBeTruthy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,0,1,0])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,0,1,1])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,0,1,2])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,0,2,0])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,0,2,1])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,0,2,2])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,0,0,0])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,1,0,0,0])).toBeTruthy();
                expect(scoreMakesSense('parer', 'abhor', [0,2,0,0,0])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,1,0,0])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,1,1,0,0])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,2,1,0,0])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,2,0,0])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,1,2,0,0])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,2,2,0,0])).toBeFalsy();
                expect(scoreMakesSense('parer', 'abhor', [0,1,0,0,2])).toBeFalsy();
                // Now the only possible truthers
                expect(scoreMakesSense('parer', 'abhor', [0,1,0,0,0])).toBeTruthy();
                expect(scoreMakesSense('parer', 'abhor', [0,1,0,0,1])).toBeTruthy();
                expect(scoreMakesSense('parer', 'abhor', [0,1,0,1,2])).toBeTruthy();
                expect(scoreMakesSense('parer', 'abhor', [0,1,0,2,2])).toBeTruthy();
                expect(scoreMakesSense('parer', 'abhor', [0,1,1,0,2])).toBeTruthy();
                expect(scoreMakesSense('parer', 'abhor', [0,1,2,0,2])).toBeTruthy();
                expect(scoreMakesSense('parer', 'abhor', [0,0,0,0,2])).toBeTruthy();
                expect(scoreMakesSense('parer', 'abhor', [0,2,0,0,2])).toBeTruthy();
                expect(scoreMakesSense('parer', 'abhor', [1,1,0,0,2])).toBeTruthy();
                expect(scoreMakesSense('parer', 'abhor', [2,1,0,0,2])).toBeTruthy();
            })
        });
    });
    describe('full word list', () => {
        describe('how many for grape', () => {
            const currentWordList = WORDS.concat([]);
            it('finds matches for grape', () => {
                const wordList2 = evalPossibleWords('grape', [2, 2, 2, 2, 2], currentWordList)
                expect(wordList2).toEqual(['drape', 'grace', 'grade', 'graph', 'grate', 'grave', 'graze', 'gripe', 'grope']);
            });
        });
        describe('updateSolver for miner', () => {
            const currentWordList = WORDS.concat([]);
            const solverData = getSolverData();
            const guesses = [];
            const scores = [];
            solverData.possibleWords = currentWordList;
            test('follow through 4 lines', () => {
                updateSolver(guesses, scores, solverData);

                guesses.push('sauce');
                scores.push([2, 0, 0, 0, 1]);
                updateSolver(guesses, scores, solverData);
                expect(solverData.level).toEqual(1);
                expect(solverData.possibleWordCounts[0]).toEqual(427);
                expect(solverData.possibleWords.length).toBe(427);

                guesses.push('cause');
                scores.push([0, 0, 1, 0, 1]);
                updateSolver(guesses, scores, solverData);
                expect(solverData.level).toEqual(2);
                expect(solverData.possibleWordCounts[1]).toEqual(263);
                expect(solverData.possibleWords.length).toBe(263);
                expect(solverData.possibleWords).toContain('miner');

                guesses.push('suite');
                scores.push([0, 1, 1, 0, 1]);
                updateSolver(guesses, scores, solverData);
                expect(solverData.level).toEqual(3);
                expect(solverData.possibleWords.length).toBe(45);
                expect(solverData.possibleWords).toContain('miner');

                guesses.push('diner');
                scores.push([0, 2, 0, 2, 2]);
                updateSolver(guesses, scores, solverData);
                expect(solverData.level).toEqual(4);
                expect(solverData.possibleWords.length).toBe(8);
                expect(solverData.possibleWords).toContain('miner');

                guesses.push('liner');
                scores.push([0, 2, 2, 2, 1]);
                updateSolver(guesses, scores, solverData);
                expect(solverData.level).toEqual(5);
                expect(solverData.possibleWords.length).toBe(2);
                expect(solverData.possibleWords).toContain('miner');

                guesses.push('finer');
                scores.push([1, 2, 2, 2, 2]);
                updateSolver(guesses, scores, solverData);
                expect(solverData.level).toEqual(6);
                expect(solverData.possibleWords.length).toBe(1);
                expect(solverData.possibleWords).toContain('miner');
            });
        });
    });
});
