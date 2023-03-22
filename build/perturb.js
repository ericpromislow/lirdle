/**
 * returns a good answer, tries not to give away too much too often
 * @param guessWord
 * @param scores
 * @param lettersByPosition - { color: <string or array of strings> }
 * @return [position, direction (-1 or +1)
 */

export function perturb(guessWord, scores, lettersByPosition) {
    const i = Math.floor(Math.random() * scores.length);
    const direction = Math.random() < 0.5 ? -1 : +1;
    if (scoreContradiction(guessWord, scores, lettersByPosition, [i, direction]) === 0) {
        return [i, direction];
    }

    // We picked a contraction. Favor the others, but now we need to evaluate all possible 10 moves
    let indices = [];
    const directives = [];
    for (let i = 0; i < 5; i++) {
        directives.push([i, -1]);
        directives.push([i, +1]);
    }
    for (let i = 0; i < directives.length; i++) {
        let score = scoreContradiction(guessWord, scores, lettersByPosition, directives[i]);
        if (score < 0) {
            score = 0;
        }
        let numIters = 10 - score;
        for (let j = 0; j < numIters; j++) {
            indices.push(i);
        }
    }
    if (indices.length === 0) {
        indices = [];
        for (let i = 0; i < 10; i++) {
            indices.push(i);
        }
    }
    // console.log(`QQQ: so pick from indices: [${ indices }]`);
    const index = indices[Math.floor(Math.random() * indices.length)];
    return directives[index];
}

export function scoreContradiction(guessWord, scores, lettersByPosition, directive) {
    const greenLettersByPosition = lettersByPosition.green; // array of strings
    const directivesByWord = lettersByPosition.assignments; // hash of string => array of directives
    const blackPositions = lettersByPosition.black || {};
    const yellowPositions = lettersByPosition.yellow || {};
    if (!greenLettersByPosition && !directivesByWord && !blackPositions && !yellowPositions)  {
	    // console.log(`QQQ: no directives, no green letters`);
        return 0;
    }
    const directives = directivesByWord && directivesByWord[guessWord];
    // console.log(`QQQ: can we find ${ directive } in ${ directives }?`)
    if (directives && directives.find(dir => dir[0] === directive[0] && dir[1] === directive[1])) {
        // console.log(`QQQ: found directive [${ directive }], don't want it`);
        return 9;
    }
    const [posn, direction] = directive;
    const oldVal = scores[posn] + 3;
    const newVal = (oldVal + direction) % 3;
    const c = guessWord[posn];
    if (newVal !== 2) {
        const [otherPositions, samePositions] = newVal === 0 ? [yellowPositions, blackPositions] : [blackPositions, yellowPositions];
        const delta = (otherPositions[c] || 0) - (samePositions[c] || 0);
        if (delta > 0) {
            return delta >= 9 ? 9 : delta;
        }
        // console.log(`QQQ: got newVal = ${ newVal }, contradiction score 0`)
        return 0;
    }
    if (!greenLettersByPosition) {
        return 0;
    }
    // console.log(`QQQ: posn ${ posn }, newVal 2, char ${ c }`);
    // console.log(`QQQ: lettersByPosition.green: ${ lettersByPosition.green }`);
    const currentGreensAtPosn = lettersByPosition.green[posn];
    // console.log(`QQQ: currentGreensAtPosn: ${ currentGreensAtPosn }`);
    // if (currentGreensAtPosn) {
    //     console.log(`QQQ: currentGreensAtPosn.includes(c): ${currentGreensAtPosn.includes(c)}`);
    // }
    if (!currentGreensAtPosn || currentGreensAtPosn.includes(c)) {
        // console.log(`QQQ: no green here, contradiction score 0`)
        return 0;
    }
    // console.log(`QQQ: currentGreensAtPosn.length: ${ currentGreensAtPosn.length }`);
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
