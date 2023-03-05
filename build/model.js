// Copyright (C) 2023 Bovination Productions, MIT License

import { WORDS, OTHERWORDS } from "./words.js";
import { devMode, getDateNumber, getWordNumber, perturb } from "./numbers.js";
import beep from "./beep.js";
import Stats from "./stats.js";

const INIT_NUM_ROWS = 6;
const EMOJI_BLACK = String.fromCodePoint(0x25fc);
const EMOJI_RIGHT_ARROW = String.fromCodePoint(0x2192);
const EMOJI_YELLOW = String.fromCodePoint(0x1f7e8);
const EMOJI_GREEN = String.fromCodePoint(0x1f7e9);
const EMOJI_COLORS = [EMOJI_BLACK, EMOJI_YELLOW, EMOJI_GREEN];

export default function Model(view) {
    this.saveableState = {
        changes: [],
        date: null,
        finished: false,
        guessWords: [],
        numBoardRows: INIT_NUM_ROWS,
        scores: [],
        wordNumber: -1,
    };
    this.initState();

    this.view = view;
    this.stats = new Stats();
}

Model.prototype = {
    initialize() {
        this.initState();
        try {
            this.loadLocalStorage();
        } catch (ex) {
            console.log(`Error loading local storage: ${ex}`);
            this.defaultInitSavableState();
        }
        this.view.initBoard(this.saveableState.numBoardRows);
    },

    loadLocalStorage() {
        try {
            this.prefs = JSON.parse(localStorage.getItem('prefs'));
        } catch {
            this.prefs = null;
        }
        if (!this.prefs) {
            this.prefs = { theme: 'classic' };
        }
        try {
            const stats = JSON.parse(localStorage.getItem('stats'));
            this.stats.initialize(stats);
        } catch(e) {
            console.log(`Couldn't read stats: ${ e }`);
            this.stats.initialize(null);
        }
        const savedState = JSON.parse(localStorage.getItem('saveableState'));
        // console.log(`savedState:`, savedState);
        if (savedState.date !== getDateNumber()) {
            if (!savedState.finished) {
                doFetch('unfinished', { date: savedState.date, count: savedState.guessWords.length });
                this.stats.addUnfinishedGame(savedState.guessWords.length);
                this.saveStats();
            }
            throw new Error(`Ignoring unfinished work from ${savedState.date}`);
        }
        Object.assign(this.saveableState, savedState);
        this.targetString = WORDS[this.saveableState.wordNumber];
        if (this.saveableState.numBoardRows < this.saveableState.guessWords.length) {
            this.saveableState.numBoardRows = this.saveableState.guessWords.length;
        }
        this.view.populateBoardFromSaveableState(this.saveableState.numBoardRows, this.saveableState.guessWords, this.saveableState.scores);
        if (this.saveableState.finished) {
            if (devMode()) {
                this.view.clearBoard();
                this.initState();
                throw new Error("Need replays for dev purposes.");
            } else {
                this.allDone = true;
                this.view.showTheWin(this.saveableState.guessWords.length, this.saveableState.changes);
                doFetch('waiting', { date: savedState.date });
            }
        } else {
            doFetch('continue', { date: savedState.date, count: savedState.guessWords.length });
        }
        this.guessCount = this.saveableState.guessWords.length;
    },

    updateSaveableState() {
        try {
            localStorage.setItem('saveableState', JSON.stringify(this.saveableState));
        } catch (ex) {
            console.log(`can't set local storage: ${ex}`);
            alert(`can't set local storage: ${ex}`);
        }
    },
    saveStats() {
        try {
            localStorage.setItem('stats', JSON.stringify(this.stats));
        } catch (ex) {
            console.log(`can't set local storage: ${ex}`);
        }
    },
    changeTheme(theme) {
        this.prefs.theme = theme;
        this.savePrefs();
        doFetch('changeTheme', { date: this.saveableState.date, theme: theme });
    },
    savePrefs() {
        try {
            localStorage.setItem('prefs', JSON.stringify(this.prefs));
        } catch (ex) {
            console.log(`can't set local storage: ${ex}`);
        }
    },

    defaultInitSavableState() {
        this.saveableState.changes = [];
        this.saveableState.date = getDateNumber();
        this.saveableState.guessWords = [];
        this.saveableState.numBoardRows = INIT_NUM_ROWS;
        this.saveableState.scores = [];
        this.saveableState.wordNumber = getWordNumber(this.saveableState.date);
        this.targetString = WORDS[this.saveableState.wordNumber];
        doFetch('start', { date: this.saveableState.date });
        // console.log(`Secret string is ${this.targetString}`);
    },

    initState() {
        this.currentGuess = [];
        this.guessCount = 0;
        this.nextLetterPosition = 0;
        this.scoresByLetter = {};
        this.targetString = '';
        this.isInvalidWord = false;
        this.allDone = false;
    },

    checkGuess() {
        const guessString = this.currentGuess.join('');
        if (guessString.length !== 5) {
            return;
        }

        if (this.isInvalidWord) {
            return;
        }
        if (!WORDS.includes(guessString) && !OTHERWORDS.includes(guessString)) {
            // We shouldn't get here now
            this.isInvalidWord = true;
            this.view.changeInvalidWordState(this.guessCount, true);
            return;
        }

        this.saveableState.guessWords.push(guessString);
        const target = Array.from(this.targetString);
        const myGuess = Array.from(this.currentGuess);
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
                myGuess[i] = target[letterPosition] = "#";
            }
        }
        const guessedIt = guessString === this.targetString;
        let newScores;
        if (guessedIt) {
            newScores = scores;
            this.stats.addFinishedGame(this.saveableState.guessWords.length);
            this.saveStats();
        } else {
            newScores = [].concat(scores);
            perturb(newScores, this.saveableState.changes);
        }
        for (let i = 0; i < 5; i++) {
            this.addColorHit(this.currentGuess[i], newScores[i]);
        }
        this.saveableState.scores.push(newScores);
        this.view.enterScoredGuess(guessString, newScores, this.guessCount, guessedIt, false);
        this.guessCount += 1;

        if (guessedIt) {
            this.saveableState.finished = true;
            this.view.showTheWin(this.guessCount, this.saveableState.changes);
            doFetch('finished', { date: this.saveableState.date, count: this.guessCount });
        } else {
            if (this.guessCount >= this.saveableState.numBoardRows) {
                this.view.appendBoardRow();
                this.saveableState.numBoardRows += 1;
            }
            doFetch('guess', { date: this.saveableState.date, count: this.guessCount });
        }
        this.currentGuess = [];
        this.nextLetterPosition = 0;
        this.updateSaveableState();
    },

    addColorHit(letter, score) {
        if (!(letter in this.scoresByLetter)) {
            this.scoresByLetter[letter] = [0, 0, 0];
        }
        this.scoresByLetter[letter][score] += 1;
    },

    deleteLetter() {
        if (this.currentGuess === 0) {
            beep();
            return;
        }
        this.view.deleteLetter(this.guessCount, this.nextLetterPosition - 1);
        this.currentGuess.pop();
        this.nextLetterPosition -= 1;
        if (this.nextLetterPosition === 4 && this.isInvalidWord) {
            this.isInvalidWord = false;
            this.view.changeInvalidWordState(this.guessCount, false);
        }
    },

    insertLetter(pressedKey) {
        const rowNum = this.guessCount;
        const colNum = this.nextLetterPosition;
        this.view.insertLetter(pressedKey, rowNum, colNum);
        this.currentGuess.push(pressedKey);
        this.nextLetterPosition += 1;
        if (this.nextLetterPosition === 5) {
            const guessString = this.currentGuess.join('');
            if (!WORDS.includes(guessString) && !OTHERWORDS.includes(guessString)) {
                this.isInvalidWord = true;
                this.view.changeInvalidWordState(this.guessCount, true, '');
            } else if (this.saveableState.guessWords.includes(guessString)) {
                // Have more to do
                this.isInvalidWord = true;
                this.view.changeInvalidWordState(this.guessCount, true, guessString);
            }
        }
    },
    getShareText() {
        // We started on Feb. 18
        const gameNumber = ((getDateNumber() - 20230218) % WORDS.length) + 1;
        const scores = this.saveableState.scores;
        const changes = this.saveableState.changes;
        const scoreLines = scores.map((scoreLine, i) => {
            const changeLine = changes[i] ?? [-1];
            const emojiBits = scoreLine.flatMap((scoreBit, j) => {
                if (changeLine[0] === j) {
                    return ['|',
                        EMOJI_COLORS[changeLine[1]],
                        EMOJI_RIGHT_ARROW,
                        EMOJI_COLORS[changeLine[2]], '|'];
                } else {
                    return EMOJI_COLORS[scores[i][j]];
                }
            });
            return emojiBits.join('');
        });
        return [`Lirdle game #${ gameNumber }`,
            '',
            `Solved in ${ scores.length } tr${ scores.length === 1 ? 'y!' : 'ies.' }`,
            '',
            scoreLines.join('\n'),
            '',
            'lirdle.com - the lying word game'].join('\n');
    }
};

function doFetch(endpoint, options) {
    if (('date' in options) && typeof(options.date) == 'number' && options.date > 20230218) {
        options.date -= 20230218;
    }
    fetch(`/usage/${ endpoint }?${ new URLSearchParams(options) }`).then((response) => {
        // ignore the response
    }).catch((err) => {
        // yeah, ignore this too
    });
}
