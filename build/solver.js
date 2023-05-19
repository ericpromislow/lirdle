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
        if (possibleWords.length === 0) {
            throw new Error("Can't happen - no words match this line")
        }
        solver.possibleWords = possibleWords;
        solver.possibleWordCounts[solver.level] = possibleWords.length;
        solver.level += 1;
    }
}

export function evalPossibleWords(guess, scores, currentWordList) {
    const possibleWords = {};
    const lim = currentWordList.length;
    for (let i = 0; i < lim; i++) {
        const candidateWord = currentWordList[i];
        if (scoreMakesSense(guess, candidateWord, scores)) {
            possibleWords[candidateWord] = true;
        }
    }
    return Object.keys(possibleWords);
}

export function evaluateGuess(targetWord, guess) {
    const target = Array.from(targetWord);
    const myGuess = Array.from(guess);
    const scores = [0, 0, 0, 0, 0];

    // Issue #19: find the perfect hits first!
    for (let i = 0; i < 5; i++) {
        if (myGuess[i] === target[i]) {
            scores[i] = 2;
            myGuess[i] = target[i] = '#';
        }
    }
    for (let i = 0; i < 5; i++) {
        if (myGuess[i] === '#') {
            continue;
        }
        let letterPosition = target.indexOf(myGuess[i]);
        if (letterPosition !== -1) {
            scores[i] = 1;
            target[letterPosition] = "#";
        }
    }
    return scores;
}

export function scoreMakesSense(guess, candidateWord, scores) {
    const thisScores = evaluateGuess(candidateWord, guess);
    if (thisScores.length !== scores.length) {
        throw new Error(`Doesn't make sense: expected ${ scores.length } scores, got ${ thisScores.length }`)
    }
    return thisScores.filter((elt, i) => { return elt !== scores[i] }).length === 1;
}