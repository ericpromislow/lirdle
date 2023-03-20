/**
 * returns a good answer, tries not to give away too much too often
 * @param guessWord
 * @param scores
 * @param greenLettersByPosition - array of strings
 * @return [position, direction (-1 or +1)
 */

export function perturb(guessWord, scores, greenLettersByPosition) {
    const i = Math.floor(Math.random() * scores.length);
    const oldVal = scores[i] + 3;
    const direction = Math.random() < 0.5 ? -1 : +1;
    const newVal = (oldVal + direction) % 3;
    if (newVal !== 2 ||
        scoreContradiction(guessWord, scores, greenLettersByPosition, [i, direction]) === 0) {
        return [i, direction];
    }

    // We picked a contraction. Favor the others, but now we need to evaluate all possible 10 moves
    const indices = [];
    const directives = [];
    for (let i = 0; i < 5; i++) {
        directives.push([i, -1]);
        directives.push([i, +1]);
    }
    for (let i = 0; i < directives.length; i++) {
        const score = scoreContradiction(guessWord, scores, greenLettersByPosition, directives[i]);
        let numIters = 10 - score;
        for (let j = 0; j < numIters; j++) {
            indices.push(i);
        }
    }
    const index = indices[Math.floor(Math.random() * indices.length)];
    return directives[index];
}

export function scoreContradiction(guessWord, scores, greenLettersByPosition, directive) {
    const [posn, direction] = directive;
    const oldVal = scores[posn] + 3;
    const newVal = (oldVal + direction) % 3;
    if (newVal !== 2) {
        return 0;
    }
    const c = guessWord[posn];
    const currentGreensAtPosn = greenLettersByPosition[posn];
    if (!currentGreensAtPosn|| currentGreensAtPosn.includes(c)) {
        return 0;
    }
    switch(currentGreensAtPosn.length) {
        case 1:
            // Weight this too high and it makes it likelier the second green is truthful
            return 3;
        case 2:
            return 7;
        default:
            return 9;
    }
}
