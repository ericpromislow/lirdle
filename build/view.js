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
                this.model.addColorHit(guessWords[i][j], scores[i][j]);
                this.insertLetter(guessWords[i][j], i, j);
            }
            this.enterScoredGuess(guessWords[i], scores[i], i, false, true);
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

    clearBoard() {
        if (!this.board) {
            alert("No board in clearBoard!");
            return;
        }
        while (this.board.childElementCount) {
            this.board.removeChild(this.board.lastChild);
        }
        for (const elem of document.getElementsByClassName("keyboard-button")) {
            elem.style.backgroundColor = 'white';
        }
    },

    enterScoredGuess(currentGuess, scores, guessCount, guessedIt, immediate) {
        const row = document.getElementsByClassName("letter-row")[guessCount];
        const limit = 5;
        const enterScoredGuessForEntry = (i) => {
            if (i >= limit) {
                return;
            }
            const box = row.children[i];
            const letter = currentGuess[i]; // array or string
            const letterColor = ['grey', 'yellow', 'green'][scores[i]];
            box.style.backgroundColor = letterColor;
            this.shadeKeyboard(letter, letterColor, guessedIt, this.model.scoresByLetter[letter]);
            if (immediate) {
                enterScoredGuessForEntry(i + 1);
            } else {
                setTimeout(enterScoredGuessForEntry, 100, i + 1);
            }
        };
        enterScoredGuessForEntry(0);
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

    shadeKeyboard(letter, color, guessIt, numHitsForEachScore) {
        for (const elem of document.getElementsByClassName("keyboard-button")) {
            if (elem.textContent === letter) {
                if (guessIt) {
                    elem.style.backgroundColor = color;
                } else if (numHitsForEachScore[2]) {
                    //TODO: Gradient these
                    elem.style.backgroundColor = "#bfd200";
                } else if (numHitsForEachScore[1]) {
                    elem.style.backgroundColor = "#ecf39e";
                } else if (numHitsForEachScore[0]) {
                    elem.style.backgroundColor = "#bdd5ea";
                }
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