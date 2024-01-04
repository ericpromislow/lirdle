// Copyright (C) 2023 Bovination Productions, MIT License

import { WORDS, OTHERWORDS } from "./words.js";
import { devMode, getDateNumber, getWordNumber, lie } from "./numbers.js";
import Stats from "./stats.js";
import { getSolverData, updateSolver} from './solver.js';

const INIT_NUM_ROWS = 6;
const EMOJI_BLACK = String.fromCodePoint(0x25fc);
const EMOJI_RIGHT_ARROW = String.fromCodePoint(0x2192);
const EMOJI_YELLOW = String.fromCodePoint(0x1f7e8);
const EMOJI_GREEN = String.fromCodePoint(0x1f7e9);
const EMOJI_COLORS = [EMOJI_BLACK, EMOJI_YELLOW, EMOJI_GREEN];

const DUPLICATE_WORD_INTERVAL = 8;
const NON_WORD_INTERVAL = 12;

const CHARGE_NONE = 0;
const CHARGE_DUPLICATE = 1;
const CHARGE_NON_WORD = 2;

export default function Model(view) {
    this.saveableState = {
        changes: [],
        date: null,
        finished: false,
        guessWords: [],
        numBoardRows: INIT_NUM_ROWS,
        scores: [],
        wordNumber: -1,
        numDuplicateWordsEarned: 0,
        numNonWordsEarned: 0,
        markers: [],
    };
    this.initState();

    this.view = view;
    this.stats = new Stats();
    this.doneFunc = () => {
        console.log("Lirdle: doneFunc not done set");
    }
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
            if (this.prefs) {
                if (!('hints' in this.prefs)) {
                    this.prefs.hints = false; // they're opt-in
                }
                const hints = document.getElementById('toggle-hints');
                if (hints) {
                    hints.labels[0].textContent = `Hints are ${this.prefs.hints ? 'on' : 'off'}`;
                    hints.checked = this.prefs.hints;
                }
                if (!('showNumLeft' in this.prefs)) {
                    this.prefs.showNumLeft = false; // they're opt-in
                }
                const showNumLeft = document.getElementById('toggle-num-left');
                if (showNumLeft) {
                    showNumLeft.labels[0].textContent = `Showing # possibilities is ${this.prefs.showNumLeft ? 'on' : 'off'}`;
                    showNumLeft.checked = this.prefs.showNumLeft;
                }
            }
        } catch {
            this.prefs = null;
        }
        if (!this.prefs) {
            this.prefs = { theme: 'classic', hints: false }; // , hints: document.getElementById() };
            const hints = document.getElementById('toggle-hints');
            if (hints) {
                hints.checked = false;
            }
        }
        try {
            const stats = JSON.parse(localStorage.getItem('stats'));
            this.stats.initialize(stats);
        } catch(e) {
            console.log(`Couldn't read stats: ${ e }`);
            this.stats.initialize(null);
        }
        const savedState = JSON.parse(localStorage.getItem('saveableState'));
        const currentDate = getDateNumber();
        // console.log(`savedState:`, savedState);
        if (savedState.date !== currentDate) {
            if (!savedState.finished) {
                doFetch('unfinished', { date: currentDate, from: getInternalDateNumber(savedState.date), count: savedState.guessWords.length });
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
        this.view.populateBoardFromSaveableState(this.saveableState.numBoardRows, this.saveableState.guessWords, this.saveableState.scores, this.saveableState.markers);
        updateSolver(this.saveableState.guessWords, this.saveableState.scores, this.solverData, this.saveableState.finished);
        for (let i = 0; i < this.solverData.level; i++) {
            this.view.showOrHideNumLeftForRow(this.prefs.showNumLeft, i);
            this.view.updateShowNumLeft(this.prefs.showNumLeft, i, this.solverData.possibleWordCounts[i]);
        }
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
            this.view.updateHintCounts({
                numDuplicateWordsEarned: this.saveableState.numDuplicateWordsEarned,
                numNonWordsEarned: this.saveableState.numNonWordsEarned,
            });
            const lastNumLeftIndex = this.solverData.level - 1;
            this.view.showOrHideNumLeftForRow(this.prefs.showNumLeft, lastNumLeftIndex);
            this.view.updateShowNumLeft(this.prefs.showNumLeft, lastNumLeftIndex, this.solverData.possibleWordCounts[lastNumLeftIndex]);
        }
        this.guessCount = this.saveableState.guessWords.length;
    },

    clearMarkers(event) {
        try {
            let madeChange = false;
            for (const cls of ["show-lie", "show-perceived-truth"]) {
                for (const elt of Array.from(this.view.board.querySelectorAll(`div.letter-row div.letter-box.${ cls }`))) {
                    elt.classList.remove(cls);
                    madeChange = true;
                }
            }
            if (madeChange) {
                this.updateSaveableState();
                event.target.disabled = true;
            }
        } catch(e) {
            console.log(`Error clearing markers: ${ e }`)
        }
    },

    updateSaveableState() {
        try {
            const rows = this.view.board.querySelectorAll('div.letter-row');
            const numRows = rows.length;
            const markers = [];
            let sawAMarker = false;
            for (let i = 0; i < numRows; i++) {
                markers.push([]);
                const theseMarkers = markers[i];
                const currentRow = rows.item(i);
                const boxes = currentRow.querySelectorAll('div.letter-box');
                for (let j = 0; j < boxes.length; j++) {
                    const boxClassList = boxes.item(j).classList;
                    if (boxClassList.contains("show-lie")) {
                        theseMarkers.push("show-lie");
                        sawAMarker = true;
                    } else if (boxClassList.contains("show-perceived-truth")) {
                        theseMarkers.push("show-perceived-truth");
                        sawAMarker = true;
                    } else {
                        theseMarkers.push('');
                    }
                }
            }
            this.saveableState.markers = markers;
            this.clearMarkersButton.disabled = !sawAMarker;
        } catch(e) {
            console.error(e);
        }
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
        this.saveableState.numDuplicateWordsEarned  = 0;
        this.saveableState.numNonWordsEarned  = 0;
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
        this.isNonTargetWord = false;
        this.chargeInvalidWord = 0; // 1: charge dup, 2: charge non-word
        this.allDone = false;
        this.lettersByPosition = {
            black: {}, yellow: {},  // hash of letter to # occurrences (don't deal with duplicates)
            green: ["", "", "", "", ""],
            assignments: {}, // hash of a word to an array of directives
            };
        this.solverData = getSolverData();
    },

    checkGuess() {
        const guessString = this.currentGuess.join('');
        if (guessString.length !== 5) {
            return;
        }

        if (this.chargeInvalidWord === CHARGE_DUPLICATE && this.saveableState.numDuplicateWordsEarned > 0) {
            doFetch('chargeDuplicateHint', {
                date: this.saveableState.date,
                count: this.guessCount,
                savings: this.saveableState.numDuplicateWordsEarned
            });
            this.saveableState.numDuplicateWordsEarned -= 1;
            this.chargeInvalidWord = CHARGE_NONE
            this.view.clearInvalidWordPrompt('dupWordHint');
            this.view.updateHintCounts({numDuplicateWordsEarned: this.saveableState.numDuplicateWordsEarned});
        } else if (this.chargeInvalidWord === CHARGE_NON_WORD && this.saveableState.numNonWordsEarned > 0) {
            doFetch('chargeNonWordHint', {
                date: this.saveableState.date,
                count: this.guessCount,
                savings: this.saveableState.numNonWordsEarned,
                word: guessString,
            });
            this.saveableState.numNonWordsEarned -= 1;
            this.chargeInvalidWord = CHARGE_NONE;
            this.view.clearInvalidWordPrompt('nonWordHint');
            this.view.updateHintCounts({numNonWordsEarned: this.saveableState.numNonWordsEarned});
        } else if (this.isInvalidWord) {
            return;
        } else if (!WORDS.includes(guessString) && !OTHERWORDS.includes(guessString)) {
            // We shouldn't get here now
            this.isInvalidWord = true;
            this.view.changeInvalidWordState(this.guessCount, true);
            return;
        }

        this.saveableState.guessWords.push(guessString);
        const scores = this.evaluateGuessAtModel(this.targetString, this.currentGuess);
        const guessedIt = guessString === this.targetString;
        let newScores;
        if (guessedIt) {
            newScores = scores;
            this.stats.addFinishedGame(this.saveableState.guessWords.length);
            this.saveStats();
        } else {
            newScores = [].concat(scores);
            lie(guessString, newScores, this.lettersByPosition, this.saveableState.changes, this.solverData);
        }
        for (let i = 0; i < 5; i++) {
            this.addColorHit(this.currentGuess[i], newScores[i]);
            this.addLetterPosition(i, guessString[i], newScores[i]);
        }
        this.saveableState.scores.push(newScores);
        this.view.enterScoredGuess(guessString, newScores, this.guessCount, guessedIt, false);
        this.guessCount += 1;
        this.isNonTargetWord = false;

        if (guessedIt) {
            this.saveableState.finished = true;
            this.view.showTheWin(this.guessCount, this.saveableState.changes);
            this.doneFunc();
            if (!this.prefs.showNumLeft) {
                const sd = this.solverData;
                for (let i = 0; i < sd.level; i++) {
                    this.view.showOrHideNumLeftForRow(true, i);
                }
            }
            doFetch('finished', { date: this.saveableState.date, count: this.guessCount });
        } else {
            if (this.guessCount >= this.saveableState.numBoardRows) {
                this.view.appendBoardRow();
                this.saveableState.numBoardRows += 1;
            }
            const intervalUpdates = {};
            if (this.guessCount % DUPLICATE_WORD_INTERVAL === 0) {
                this.saveableState.numDuplicateWordsEarned += 1;
                intervalUpdates.numDuplicateWordsEarned = this.saveableState.numDuplicateWordsEarned;
            }
            if (this.guessCount % NON_WORD_INTERVAL === 0) {
                this.saveableState.numNonWordsEarned += 1;
                intervalUpdates.numNonWordsEarned = this.saveableState.numNonWordsEarned;
            }
            if (Object.keys(intervalUpdates).length > 0) {
                this.view.updateHintCounts(intervalUpdates);
            }
            if (newScores.every(x => x === 2)) {
                // We have a fakeout
                this.stats.addFiveGreenFakeOut();
                this.view.showHitFakeOut(); //TODO: Implement
            }
            //const t1 = (new Date()).valueOf();
            updateSolver(this.saveableState.guessWords, this.saveableState.scores, this.solverData);
            this.view.showOrHideNumLeftForRow(this.prefs.showNumLeft, this.solverData.level - 1);
            this.view.updateShowNumLeft(this.prefs.showNumLeft, this.solverData.level - 1, this.solverData.possibleWords.length);
            doFetch('guess', { date: this.saveableState.date, count: this.guessCount, numLeft: this.solverData.possibleWords.length });
            // const t2 = (new Date()).valueOf();
            // console.log(`calc time: ${ t2 - t1 } msec`)
        }
        this.currentGuess = [];
        this.nextLetterPosition = 0;
        this.updateSaveableState();
    },
    evaluateGuessAtModel(targetWord, guess) {
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
    },

    addColorHit(letter, score) {
        if (!(letter in this.scoresByLetter)) {
            this.scoresByLetter[letter] = [0, 0, 0];
        }
        this.scoresByLetter[letter][score] += 1;
    },

    addLetterPosition(j, letter, score) {
        switch(score) {
            case 0:
                if (!(letter in this.lettersByPosition.black)) {
                    this.lettersByPosition.black[letter] = 0;
                }
                this.lettersByPosition.black[letter] += 1;
                break;
            case 1:
                if (!(letter in this.lettersByPosition.yellow)) {
                    this.lettersByPosition.yellow[letter] = 0;
                }
                this.lettersByPosition.yellow[letter] += 1;
                break;
            case 2:
                if (!this.lettersByPosition.green[j].includes(letter)) {
                    this.lettersByPosition.green[j] += letter;
                }
        }
    },

    deleteLetter() {
        if (this.currentGuess === 0) {
            return;
        }
        this.view.deleteLetter(this.guessCount, this.nextLetterPosition - 1);
        this.currentGuess.pop();
        this.nextLetterPosition -= 1;
        if (this.nextLetterPosition === 4) {
            if (this.isInvalidWord) {
                this.isInvalidWord = false;
                this.view.changeInvalidWordState(this.guessCount, false);
            } else if (this.chargeInvalidWord !== CHARGE_NONE) {
                this.view.clearInvalidWordPrompt();
                this.chargeInvalidWord = CHARGE_NONE;
            } else if (this.isNonTargetWord) {
                this.isNonTargetWord = false;
                this.view.changeNonTargetWordState(false);
            } 
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
                if (this.prefs.hints && this.saveableState.numNonWordsEarned > 0) {
                    this.chargeInvalidWord = CHARGE_NON_WORD;
                    this.view.showInvalidWordPrompt("nonWordHint");
                } else {
                    this.isInvalidWord = true;
                    this.view.changeInvalidWordState(this.guessCount, true, '');
                }
            } else if (this.saveableState.guessWords.includes(guessString)) {
                 if (!WORDS.includes(guessString) && OTHERWORDS.includes(guessString)) {
                        this.isNonTargetWord = true;
                        this.view.changeNonTargetWordState(this.guessCount, true, guessString);
                }
                if (this.prefs.hints && this.saveableState.numDuplicateWordsEarned > 0) {
                    this.chargeInvalidWord = CHARGE_DUPLICATE;
                    this.view.showInvalidWordPrompt("dupWordHint");
                } else {
                    this.isInvalidWord = true;
                    this.view.changeInvalidWordState(this.guessCount, true, guessString);
                }
            } else if (!WORDS.includes(guessString) && OTHERWORDS.includes(guessString)) {
                this.isNonTargetWord = true;
                this.view.changeNonTargetWordState(true, guessString);
            }
        }
    },
    getShareText() {
        // We started on Feb. 18
        const gameNumber = ((getDateNumber() - 20230218) % WORDS.length) + 1;
        const scores = this.saveableState.scores;
        const changes = this.saveableState.changes;
        const scoreLines = scores.map((scoreLine, i) => {
            const changeLine = changes[i] || [-1];
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
            if (i < scores.length - 1) {
                emojiBits.push(' - ', this.solverData.possibleWordCounts[i]);
            }
            return emojiBits.join('');
        });
        return [`Lirdle game #${ gameNumber }`,
            '',
            `Solved in ${ scores.length } tr${ scores.length === 1 ? 'y!' : 'ies.' }`,
            '',
            scoreLines.join('\n'),
            '',
            'lirdle.com - the lying word game'].join('\n');
    },
    updateHintStatus(value) {
        this.prefs.hints = value;
        this.savePrefs();
        doFetch('toggleHintStatus', { date: this.saveableState.date, checked: value });
    },
    updateShowNumLeftStatus(showNumLeft) {
        const sd = this.solverData;
        if (sd.possibleWordCounts.length === 0) {
            return;
        }
        this.prefs.showNumLeft = showNumLeft;
        // Need to do all rows
        for (let i = 0; i < sd.level; i++) {
            this.view.updateShowNumLeft(showNumLeft, i, sd.possibleWordCounts[i]);
        }

        this.savePrefs();
        doFetch('toggleShowNumLeft', { date: this.saveableState.date, checked: showNumLeft, count: this.guessCount || 0 });
    },
};

function doFetch(endpoint, options) {
    if (('date' in options) && typeof(options.date) == 'number') {
        options.date = getInternalDateNumber(options.date);
    }
    fetch(`/usage/${ endpoint }?${ new URLSearchParams(options) }`).then((response) => {
        // ignore the response
    }).catch((err) => {
        // yeah, ignore this too
    });
}

function getInternalDateNumber(dateNumber) {
    return dateNumber - 20230218;
}
