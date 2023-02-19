import { WORDS, OTHERWORDS } from "./words.js";
import { getDateNumber, getWordNumber, perturb } from "./numbers.js";
import beep from "./beep.js";

const INIT_NUM_ROWS = 6;

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
    this.currentGuess = [];
    this.guessCount = 0;
    this.nextLetterPosition = 0;
    this.scoresByLetter = {};
    this.targetString = '';

    this.view = view;
}

Model.prototype = {
    initialize() {
        this.initState();
        setTimeout(() => {
            try {
                this.loadLocalStorage();
            } catch (ex) {
                //alert(`Error loading local storage: ${ex}`);
                console.log(`Error loading local storage: ${ex}`);
                this.defaultInitSavableState();
            }
            this.view.initBoard(this.saveableState.numBoardRows);
        }, 0);
    },

    loadLocalStorage() {
        const savedState = JSON.parse(localStorage.getItem('saveableState'));
        console.log(`savedState:`, savedState);
        if (savedState.date !== getDateNumber()) {
            //TODO: Update stats for a give-up on the old date
            throw new Error(`Ignoring unfinished work from ${savedState.date}`);
        }
        Object.assign(this.saveableState, savedState);
        this.targetString = WORDS[this.saveableState.wordNumber];
        if (this.saveableState.numBoardRows < this.saveableState.guessWords.length) {
            this.saveableState.numBoardRows = this.saveableState.guessWords.length;
        }
        this.view.populateBoardFromSaveableState(this.saveableState.numBoardRows, this.saveableState.guessWords, this.saveableState.scores);
        if (this.saveableState.finished) {
            //TODO: Do something to show they finished it.
            alert("Nothing left to do here.");
            this.view.clearBoard();
            throw new Error("Need replays for dev purposes.");
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

    defaultInitSavableState() {
        this.saveableState.changes = [];
        this.saveableState.date = getDateNumber();
        this.saveableState.guessWords = [];
        this.saveableState.numBoardRows = INIT_NUM_ROWS;
        this.saveableState.scores = [];
        this.saveableState.wordNumber = getWordNumber(this.saveableState.date);
        this.targetString = WORDS[this.saveableState.wordNumber];
        // console.log(`Secret string is ${this.targetString}`);
    },

    initState() {
        this.currentGuess = [];
        this.guessCount = 0;
        this.nextLetterPosition = 0;
    },

    checkGuess() {
        const guessString = this.currentGuess.join('');
        if (guessString.length !== 5) {
            return;
        }

        if (!WORDS.includes(guessString) && !OTHERWORDS.includes(guessString)) {
            //TODO: Stop using the alert thing
            this.view.ignoreEnter(true);
            alert(`Word ${guessString} not in word-list`);
            return;
        }

        this.saveableState.guessWords.push(guessString);
        let target = Array.from(this.targetString);
        const scores = [0, 0, 0, 0, 0];

        for (let i = 0; i < 5; i++) {
            let letterPosition = target.indexOf(this.currentGuess[i]);
            // is letter in the correct position?
            if (letterPosition !== -1) {
                scores[i] = this.currentGuess[i] === target[i] ? 2 : 1;
                target[letterPosition] = "#"
            }
        }
        const guessedIt = guessString === this.targetString;
        let newScores;
        if (guessedIt) {
            newScores = scores;
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
            setTimeout(() => {
                alert(`You got it in ${this.guessCount} guess${this.guessCount > 1 ? 'es' : ''}!`);
            }, 1_000);
        } else {
            if (this.guessCount >= this.saveableState.numBoardRows) {
                this.view.appendBoardRow();
                this.saveableState.numBoardRows += 1;
            }
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
    },

    insertLetter(pressedKey) {
        const rowNum = this.guessCount;
        const colNum = this.nextLetterPosition;
        this.view.insertLetter(pressedKey, rowNum, colNum);
        this.currentGuess.push(pressedKey);
        this.nextLetterPosition += 1;
    },
};