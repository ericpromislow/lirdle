import beep from "./beep.js";

export default function View() {
    this.board = document.getElementById("game-board");
    this._ignoreEnter = false;
    this.model = null;
}

View.prototype = {
    setModel(model) {
        this.model = model;
    },
    populateBoardFromSaveableState(numNeededRows, guessWords, scores) {
        this.initBoard(numNeededRows);
        for (let i = 0; i < guessWords.length; i++) {
            for (let j = 0; j < guessWords[i].length; j++) {
                this.insertLetter(guessWords[i][j], i, j);
            }
            this.enterScoredGuess(guessWords[i], scores[i], i, false);
        }
    },

    appendBoardRow() {
        let row = document.createElement("div");
        row.className = "letter-row";

        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            row.appendChild(box);
        }
        this.board.appendChild(row);
    },

    ignoreEnter(val) {
        this._ignoreEnter = val;
    },

    initBoard(numNeededRows) {
        for (let i = this.board.childElementCount; i < numNeededRows; i++) {
            this.appendBoardRow();
        }
    },

    enterScoredGuess(currentGuess, scores, guessCount, guessedIt) {
        const row = document.getElementsByClassName("letter-row")[guessCount];
        for (let i = 0; i < 5; i++) {
            let box = row.children[i];
            let letter = currentGuess[i]; // array or string
            const letterColor = ['grey', 'yellow', 'green'][scores[i]];
            let delay = 100 * i;

            setTimeout(() => {
                //shade box
                box.style.backgroundColor = letterColor;
                if (letterColor !== 'grey') {
                    this.shadeKeyboard(letter, guessedIt ? 'green' : 'orange');
                }
            }, delay);
        }
    },

    deleteLetter(rowNum, colNum) {
        let row = document.getElementsByClassName("letter-row")[rowNum];
        let box = row.children[colNum];
        box.textContent = "";
        box.classList.remove("filled-box");
    },

    insertLetter(pressedKey, rowNum, colNum) {
        pressedKey = pressedKey.toLowerCase();

        let row = document.getElementsByClassName("letter-row")[rowNum];
        let box = row.children[colNum];
        box.textContent = pressedKey;
        box.classList.add("filled-box");
    },

    shadeKeyboard(letter, color) {
        for (const elem of document.getElementsByClassName("keyboard-button")) {
            if (elem.textContent === letter) {
                elem.style.backgroundColor = color;
                break;
            }
        }
    },


    keyHandler(e) {
        // console.log('>> keyup');
        const pressedKey = String(e.key);
        if (pressedKey === "Backspace") {
            if (this.model.nextLetterPosition!== 0) {
                this.model.deleteLetter();
            } else {
                beep();
            }
            return;
        }
        if (pressedKey === "Enter") {
            console.log(`pressed enter, currentTarget: ${e.currentTarget}, target: ${e.target}`);
            if (this._ignoreEnter) {
                this._ignoreEnter = false;
                return;
            }
            e.stopPropagation();
            e.cancelBubble = true;
            this.model.checkGuess();
            return;
        }
        if (pressedKey.match(/^[a-z]$/i)) {
            if (this.model.nextLetterPosition === 5) {
                beep();
            } else {
                this.model.insertLetter(pressedKey);
            }
        } else {
            console.log(`Ignoring key event ${pressedKey}`);
        }
    }
}