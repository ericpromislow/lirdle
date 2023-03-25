import { WORDS } from "./words.js";

export function getSolverData() {
    return {
        level: 0,
        possibleWords: WORDS,
        possibleWordCounts: [],
    };
}

/**
 * returns a good answer, tries not to give away too much too often
 * @param guesses: array of char[5]
 * @param scores: array of number[5]
 * @param solver - { level, possibleWords: initially null when currentLevel = 0 }
 * @return void
 */
export function updateSolver(guesses, scores, solver) {
    while (solver.level < guesses.length) {
        const possibleWords = evalPossibleWords(guesses[solver.level], scores[solver.level], solver.possibleWords);
        if (solver.possibleWords.length === 0) {
            throw new Error("Can't happen - no words match this line")
        }
        solver.possibleWords = possibleWords;
        solver.possibleWordCounts[solver.level] = possibleWords.length;
        solver.level += 1;
    }
}

export function evalPossibleWords(guess, scores, currentWordList) {
    const guessLetters = guess.split('');
    const possibleWords = {};
    const lim = currentWordList.length;
    for (let i = 0; i < lim; i++) {
        const candidateWord = currentWordList[i];
        let keepGoing = true;
        for (let j = 0; j < 5 && keepGoing; j++) {
            const origScore = scores[j];
            try {
                scores[j] = (scores[j] + 2) % 3;
                // console.log(`-isPossibleWord 1(${guessLetters.join('')}, ${scores.join(',')}, ${candidateWord}}`);
                if (isPossibleWord(guessLetters, scores, candidateWord)) {
                    // console.log(`yes 1`);
                    possibleWords[candidateWord] = true;
                    keepGoing = false;
                    break;
                }
                // console.log(`no 1`);
                scores[j] = (origScore + 1) % 3;
                // console.log(`-isPossibleWord 2(${guessLetters.join('')}, ${scores.join(',')}, ${candidateWord}}`);
                if (isPossibleWord(guessLetters, scores, candidateWord)) {
                    // console.log(`yes 2`);
                    possibleWords[candidateWord] = true;
                    keepGoing = false;
                    break;
                }
                // console.log(`no 2`);
            } finally {
                scores[j] = origScore;
            }
        }
    }
    return Object.keys(possibleWords);
}

export function isPossibleWord(guessLetters, scores, candidateWord) {
    const candidateLetters = candidateWord.split('');
    // const workingGuess = [].concat(guessLetters);
    // first deal with the greens
    for (let i = 0; i < 5; i++) {
        if (scores[i] === 2) {
            if (guessLetters[i] !== candidateLetters[i]) {
                return false;
            } else {
                // block it out
                candidateLetters[i] = '*';
            }
        }
    }
    // console.log(`Found greens, word is now ${ candidateLetters.join('') }`);
    // now deal with the yellows
    for (let i = 0; i < 5; i++) {
        if (scores[i] === 1) {
            const c = guessLetters[i];
            if (candidateLetters[i] === c) {
                return false;
            }
            const idx = candidateLetters.indexOf(c);
            if (idx === -1) {
                return false;
            }
            candidateLetters[idx] = '*';
        }
    }
    // console.log(`Found yellows, word is now ${ candidateLetters.join('') }`);
    // finally deal with the blacks
    for (let i = 0; i < 5; i++) {
        if (scores[i] === 0 && candidateLetters.some(c => c === guessLetters[i])) {
            // const posn = candidateLetters.indexOf(guessLetters[i]);
            // console.log(`Black at position ${ i }, found char ${ guessLetters[i] } at posn ${ posn }`);
            return false;
        }
    }
    return true;
}