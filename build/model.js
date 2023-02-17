import { WORDS, OTHERWORDS } from "./words.js";
import { getDateNumber, getWordNumber, perturb } from "./numbers.js";

const INIT_NUM_ROWS = 6;

export function Model(view) {
    this.saveableState = {
        changes: [],
        date: null,
        finished: false,
        guessWords: [],
        numBoardRows: INIT_NUM_ROWS,
        scores: [],
        targetString: '',
    };
    this.state = {
        board: null,
        currentGuess: [],
        guessCount: 0,
        nextLetterPosition: 0,
    };
    this.view = view;
}

Model.prototype = {
    initialize() {
        this.initState();
        this.initBoard();
        setTimeout(() => {
            try {
                this.loadLocalStorage();
            } catch (ex) {
                //alert(`Error loading local storage: ${ex}`);
                console.log(`Error loading local storage: ${ex}`);
                this.defaultInitSavableState();
            }
        }, 0);
    },

    loadLocalStorage() {
        const savedState = JSON.parse(localStorage.getItem('saveableState'));
        console.log(`savedState:`, savedState);
        if (savedState.date !== this.getDateNumber()) {
            //TODO: Update stats for a giveup on the old date
            throw new Error(`Ignoring unfinished work from ${savedState.date}`);
        }
        Object.assign(this.saveableState, savedState);
        if (this.saveableState.numBoardRows < this.saveableState.guessWords.length) {
            this.saveableState.numBoardRows = this.saveableState.guessWords.length;
        }
        this.view.populateBoardFromSaveableState(this.saveableState.numBoardRows, this.saveableState.guessWords, this.saveableState.scores);
        if (this.saveableState.finished) {
            //TODO: Do something to show they finished it.
            alert("Nothing left to do here.");
        }
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
        const targetNum = getWordNumber(this.saveableState.date);
        this.saveableState.guessWords = [];
        this.saveableState.numBoardRows = INIT_NUM_ROWS;
        this.saveableState.scores = [];
        this.saveableState.targetString = WORDS[targetNum];
        console.log(`Secret string is ${this.saveableState.targetString}`);
    },

    initState(board) {
        this.state.board = board;
        this.state.currentGuess = [];
        this.state.guessCount = 0;
        this.state.nextLetterPosition = 0;
    },

    checkGuess() {
        const guessString = this.state.currentGuess.join('');
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
        let target = Array.from(this.saveableState.targetString);
        const scores = [0, 0, 0, 0, 0];

        for (let i = 0; i < 5; i++) {
            let letterPosition = target.indexOf(this.state.currentGuess[i]);
            // is letter in the correct position?
            if (letterPosition !== -1) {
                scores[i] = this.state.currentGuess[i] === target[i] ? 2 : 1;
                target[letterPosition] = "#"
            }
        }
        const guessedIt = guessString === this.saveableState.targetString;
        let newScores;
        if (guessedIt) {
            newScores = [].concat(scores);
            perturb(newScores, this.saveableState.changes);
        } else {
            newScores = scores;
        }
        this.saveableState.scores.push(newScores);
        this.view.enterScoredGuess(guessString, newScores, this.state.guessCount, guessedIt);
        this.state.guessCount += 1;

        if (guessedIt) {
            this.saveableState.finished = true;
            setTimeout(() => {
                alert(`You got it in ${this.state.guessCount} guess${this.state.guessCount > 1 ? 'es' : ''}!`);
            }, 1_000);
        } else {
            if (this.state.guessCount >= this.saveableState.numBoardRows) {
                this.view.appendBoardRow();
                this.saveableState.numBoardRows += 1;
            }
        }
        this.state.currentGuess = [];
        this.state.nextLetterPosition = 0;
        this.updateSaveableState();
    },

    deleteLetter() {
        if (this.state.currentGuess === 0) {
            this.view.beep();
            return;
        }
        this.view.deleteLetter(this.state.guessCount, this.state.nextLetterPosition - 1);
        this.state.currentGuess.pop();
        this.state.nextLetterPosition -= 1;
    },

    insertLetter(pressedKey, rowNum, colNum) {
        this.view.insertLetter(pressedKey, rowNum, colNum);
        this.state.currentGuess.push(pressedKey);
        this.state.nextLetterPosition += 1;
    },
};