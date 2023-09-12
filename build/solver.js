import { WORDS } from "./words.js";

export function getSolverData() {
    return {
        level: 0,
        possibleWords: WORDS,
        remainingWords: [],
        possibleWordCounts: [],
    };
}

/**
 * updates number of possible words remaining after each guess
 * @param guesses: array of char[5]
 * @param scores: array of number[5]
 * @param solver - { level, possibleWords: initially null when currentLevel = 0 }
 * @param finished - ignore last guess if we're finished
 * @return void
 */
export function updateSolver(guesses, scores, solver, finished=false) {
    const lim = guesses.length - (finished ? 2 : 1);
    while (solver.level <= lim) {
        const possibleWords = evalPossibleWords(guesses[solver.level], scores[solver.level], solver.possibleWords);
        if (possibleWords.length === 0) {
            throw new Error("Can't happen - no words match this line")
        }
        solver.possibleWords = possibleWords;
        solver.possibleWordCounts[solver.level] = possibleWords.length;
        solver.remainingWords[solver.level] = possibleWords;
        solver.level += 1;
    }
}

export function evalPossibleWords(guess, scores, currentWordList) {
    const possibleWords = {};
    const lim = currentWordList.length;
    if (lim === 1 && currentWordList[0] === guess) {
        // This is needed when restarting so it doesn't reject 2-2-2-2-2 on the final word
        return [guess];
    }
    for (let i = 0; i < lim; i++) {
        const candidateWord = currentWordList[i];
        if (scoreMakesSense(guess, candidateWord, scores)) {
            possibleWords[candidateWord] = true;
        }
    }
    // The miner bug -- if we're looking for possible words, make sure we drop the current one.
    delete possibleWords[guess];
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
