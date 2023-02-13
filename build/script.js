import { WORDS, OTHERWORDS } from "./words.js";

const INIT_NUM_ROWS = 6;
let guessCount = 0;
let currentGuess = [];
let nextLetter = 0;
let board;
let numBoardRows = 0;
const changes = [];
const targetNum = getWordNumber();
const targetString = WORDS[targetNum];
console.log(targetString);

function getWordNumber() {
    // return Math.floor(Math.random() * WORDS.length)
    const d = new Date();
    const year = d.getFullYear().toString();
    let month = (d.getMonth() + 1).toString();
    let date = d.getDate().toString();
    if (month.length === 1) {
        month = '0' + month;
    }
    const dayNumber = parseInt(`${ year }${ month }${ date }`, 10);
    return ((dayNumber * 2 + 1) * 1793) % WORDS.length;
}

function appendBoardRow() {
    let row = document.createElement("div");
    row.className = "letter-row";

    for (let j = 0; j < 5; j++) {
        let box = document.createElement("div");
        box.className = "letter-box";
        row.appendChild(box);
    }
    board.appendChild(row);
    numBoardRows += 1;
}

function initBoard() {
    board = document.getElementById("game-board");

    for (let i = 0; i < INIT_NUM_ROWS; i++) {
        appendBoardRow();
    }
}

initBoard();

let ignoreEnter = false;

function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[guessCount];
    let guessString = '';
    let target = Array.from(targetString);
    const scores = [0, 0, 0, 0, 0];

    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length != 5) {
        ignoreEnter = true;
        alert("Not enough letters!");
        return
    }

    if (!WORDS.includes(guessString) && !OTHERWORDS.includes(guessString)) {
        ignoreEnter = true;
        alert(`Word ${ guessString } not in word-list`);
        return
    }

    guessCount += 1;

    for (let i = 0; i < 5; i++) {
        let letterColor = '';

        let letterPosition = target.indexOf(currentGuess[i]);
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'grey';
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position
            if (currentGuess[i] === target[i]) {
                // shade green
                letterColor = 'green';
                scores[i] = 2;
            } else {
                // shade box yellow
                letterColor = 'yellow';
                scores[i] = 1;
            }

            target[letterPosition] = "#"
        }
    }
    const guessedIt = scores.every((x) => x === 2);
    const newScores = guessedIt ? scores : perturb(scores);
    for (let i = 0; i < 5; i++) {
        let box = row.children[i];
        let letter = currentGuess[i];
        const letterColor = ['grey', 'yellow', 'green'][newScores[i]];
        let delay = 100 * i;

        setTimeout(()=> {
            //shade box
            box.style.backgroundColor = letterColor;
            if (letterColor !== 'grey') {
                shadeKeyboard(letter, guessedIt ? 'green' : 'orange');
            }
        }, delay);
    }

    if (guessString === targetString) {
        setTimeout(() => {
            alert(`You got it in ${ guessCount } guess${ guessCount > 1 ? 'es' : '' }!`);
        }, 1_000);
        return;
    } else {
        currentGuess = [];
        nextLetter = 0;
        if (guessCount >= numBoardRows) {
            appendBoardRow();
        }
    }
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[guessCount];
    let box = row.children[nextLetter - 1];
    box.textContent = "";
    box.classList.remove("filled-box");
    currentGuess.pop();
    nextLetter -= 1;
}

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return;
    }
    pressedKey = pressedKey.toLowerCase();

    let row = document.getElementsByClassName("letter-row")[guessCount];
    let box = row.children[nextLetter];
    box.textContent = pressedKey;
    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    nextLetter += 1;
}

function perturb(scores) {
    const newScores = scores;
    const i = Math.floor(Math.random() * scores.length);
    const oldVal = scores[i] + 3;
    newScores[i] = (Math.random() < 0.5 ? oldVal - 1 : oldVal + 1) % 3;
    changes.push([i, scores[i], newScores[i]]);

    return newScores;
}

function shadeKeyboard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            elem.style.backgroundColor = color;
            break;
        }
    }
}

document.addEventListener("keyup", (e) => {
    // console.log('>> keyup');
    let pressedKey = String(e.key);
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") {
        console.log(`pressed enter, currentTarget: ${ e.currentTarget }, target: ${ e.target }`);
        if (ignoreEnter) {
            ignoreEnter = false;
            return;
        }
        e.stopPropagation();
        e.cancelBubble = true;
        checkGuess();
        return;
    }
    let found = pressedKey.match(/[a-z]/gi);
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey);
    }
});