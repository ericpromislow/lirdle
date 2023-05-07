// Copyright (C) 2023 Bovination Productions, MIT License

import beep from "./beep.js";
import { devMode, getDateNumber, getYesterdaysWord } from "./numbers.js";

export default function View() {
    this.board = document.getElementById("game-board");
    this.dupWord = document.getElementById("dupWord");
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        elem.style.backgroundColor = NEUTRAL_COLOR;
    }
    this.model = null;
    this.wordIsInvalid = false;
    this.gameFinished = false;
}

function pad(val, minSize, padChar) {
    let s = val.toString();
    while (s.length < minSize) {
        s = padChar + s;
    }
    return s;
}

const COLORS = ['grey', 'yellow', 'green'];
const NEUTRAL_COLOR = 'white';

View.prototype = {
    setModel(model) {
        this.model = model;
    },
    setModelContinue() {
        this.showYesterdaysWord();
        this.initializeTheme(this.model.prefs.theme);
    },
    populateBoardFromSaveableState(numNeededRows, guessWords, scores, markers) {
        this.initBoard(numNeededRows);
        const rows = this.board.querySelectorAll('div.letter-row');
        for (let i = 0; i < guessWords.length; i++) {
            for (let j = 0; j < guessWords[i].length; j++) {
                this.model.addColorHit(guessWords[i][j], scores[i][j]);
                this.model.addLetterPosition(j, guessWords[i][j], scores[i][j]);
                this.insertLetter(guessWords[i][j], i, j);
            }
            this.enterScoredGuess(guessWords[i], scores[i], i, false, true);
            try {
                if (markers && markers[i] && markers[i].some(x => x !== '')) {
                    const row = rows[i];
                    const boxes = Array.from(row.querySelectorAll('div.letter-box'));
                    for (let j = 0; j < boxes.length; j++) {
                        if (markers[i][j]) {
                            boxes[j].classList.add(markers[i][j]);
                        }
                    }
                }
            } catch(e) {
                console.error(e);
            }
        }
        if (this.board.querySelector('div.letter-row div.letter-box.show-lie') ||
            this.board.querySelector('div.letter-row div.letter-box.show-perceived-truth')) {
            setTimeout(() => {
                document.getElementById("clear-markers").disabled = false;
            }, 0);
        }
    },

    handleLetterBoxClick(e) {
        if (this.gameFinished) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        const target = e.target;
        if (!target.classList.contains('filled-box')) {
            return;
        }
        if (target.classList.contains('show-lie')) {
            target.classList.remove('show-lie');
            target.classList.add('show-perceived-truth');
        } else if (target.classList.contains('show-perceived-truth')) {
            target.classList.remove('show-perceived-truth');
        } else {
            // We avoid constraints on number of marked letters
            // due to complexity and individual preferences
            target.classList.add('show-lie');
        }
        e.preventDefault();
        this.model.updateSaveableState();
    },

    appendBoardRow() {
        const letterRowContainer = document.createElement("div");
        letterRowContainer.className = "letter-row-container";

        const balancingLeftSideNumLeftHeading = document.createElement("div");
        balancingLeftSideNumLeftHeading.classList.add("balancingLeftSideNumLeftHeading", "hidden");
        letterRowContainer.appendChild(balancingLeftSideNumLeftHeading);

        const letterRow = document.createElement("div");
        letterRow.className = "letter-row";
        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            box.addEventListener('click', this.handleLetterBoxClick.bind(this));
            letterRow.appendChild(box);
        }
        letterRowContainer.appendChild(letterRow);

        const numWordsLeft = document.createElement("div");
        numWordsLeft.classList.add("numWordsLeftContainer", "hidden");
        const numLeftHeading = document.createElement("span");
        numLeftHeading.classList.add("numLeftHeading", "hidden");
        numLeftHeading.textContent = " (" ;
        const numLeftAmount = document.createElement("span");
        numLeftAmount.className = "numLeftAmount";
        numLeftAmount.textContent = "";
        const numRightHeading = document.createElement("span");
        numRightHeading.classList.add("numLeftHeading", "hidden");
        numRightHeading.textContent = ")   " ;
        numWordsLeft.appendChild(numLeftHeading);
        numWordsLeft.appendChild(numLeftAmount);
        numWordsLeft.appendChild(numRightHeading);
        letterRowContainer.appendChild(numWordsLeft);

        this.board.appendChild(letterRowContainer);
        const classNames = ["small1", "small2", "small3", "small4"];
        const classList = this.board.classList;
        const eltCount = this.board.childElementCount;
        classList.remove(...classNames);
        if (eltCount > 24) {
            classList.add("small4");
        } else if (eltCount > 18) {
            classList.add("small3");
        } else if (eltCount > 12) {
            classList.add("small2");
        } else if (eltCount > 6) {
            classList.add("small1");
        }
    },

    showTheWin(guessCount, changes) {
        this.showWinningInfo(guessCount);
        this.showDeceptiveSquares(changes);
        this.showAllDone();
        this.showTodaysStats();
        this.gameFinished = true;
        Array.from(document.querySelectorAll('#keyboard-cont button.keyboard-button')).forEach(elt => {
            elt.setAttribute('disabled', true);
        });
    },

    showWinningInfo(guessCount) {
        const msg = `You got it in ${ guessCount } guess${ guessCount > 1 ? 'es' : ''}!`;
        const result = document.getElementById('result');
        if (!result) {
            console.log(`Can't find result div`);
            setTimeout(() => {
                alert(msg);
            }, 1000);
            return;
        }
        result.children[0].textContent = msg;
        result.classList.remove('hidden');
        result.classList.add('show');
    },

    showAllDone() {
        const msg = `until next game`;
        const allDone = document.getElementById('alldone');
        if (!allDone) {
            console.log(`Can't find div alldone`);
            setTimeout(() => {
                alert(msg);
            }, 1000);
            return;
        }
        allDone.children[0].textContent = msg;
        allDone.classList.remove('hidden');
        allDone.classList.add('show');
        const allDoneSpan = allDone.children[0];
        const startDate = getDateNumber();
        const setTimeLeft = () => {
            const thisDate = getDateNumber();
            if (thisDate > startDate) {
                allDoneSpan.textContent = "You can refresh to get a new puzzle";
                return;
            }
            const t1 = new Date();
            const times = [23 - t1.getHours(), pad(59 - t1.getMinutes(), 2, '0'), pad(59 - t1.getSeconds(), 2, '0')];
            allDoneSpan.textContent = `Next puzzle in ${ times.join(":") }`;
            setTimeout(setTimeLeft, 1 * 1000);
        }
        setTimeout(setTimeLeft, 0);
        this.showStats();
    },
    /**
     * changes: array of [index, actualResult, displayedResult]
     * @param changes
     */
    showDeceptiveSquares(changes) {
        for (let i = 0; i < changes.length; i++) {
            const rowContainer = this.board.children.item(i);
            if (!rowContainer) {
                console.log(`showDeceptiveSquares: No rowContainer at entry ${ i }`);
                break;
            }
            const rowLetters = rowContainer.querySelector(".letter-row");
            const change = changes[i];
            const box = rowLetters.children[change[0]];
            const actualColor = COLORS[change[1]];
            box.classList.add(`actual${ actualColor }`);
        }
    },

    showStats() {
        const stats = this.model.stats;
        if (stats.totalUnfinishedGames <= 2 && stats.totalFinishedGames <= 2) {
            return;
        }
        const statsDiv = document.getElementById('statistics');
        if (!statsDiv) {
            console.log("Can't find the stats div");
            return;
        }
        const statsBody = statsDiv.querySelector('div#statsBody');
        if (statsBody) {
            statsBody.innerHTML = stats.getStatsSummary();
        }
        statsDiv.classList.remove('hidden');
        statsDiv.classList.add('show');
    },

    changeInvalidWordState(rowNum, wordIsInvalid, guessString) {
        if (this.wordIsInvalid !== wordIsInvalid) {
            if (!this.wordIsInvalid) {
                this.markCurrentWordInvalid(rowNum);
                if (guessString) {
                    this.dupWord.querySelector('#dupWordContents').textContent = guessString;
                    this.dupWord.classList.remove('hidden');
                    this.dupWord.classList.add('show');
                }
            } else {
                this.markCurrentWordValid(rowNum);
                this.dupWord.classList.remove('show');
                this.dupWord.classList.add('hidden');
            }
            this.wordIsInvalid = wordIsInvalid;
        }
    },

    showInvalidWordPrompt(promptID) {
        const elt = document.getElementById(promptID);
        if (elt) {
            elt.classList.remove('hidden')
            elt.classList.add('show');
        }
    },

    clearInvalidWordPrompt(promptID="") {
        const elts = promptID ? [document.getElementById(promptID)] : Array.from(document.querySelectorAll('div.wordProblemPrompt.show'));
        for (const elt of elts) {
            if (elt) {
                elt.classList.remove('show')
                elt.classList.add('hidden');
            }
        }
    },

    markCurrentWordInvalid(rowNum) {
        const row = this.board.querySelectorAll(".letter-row-container").item(rowNum).querySelector(".letter-row");
        for (let i = 0; i < 5; i++) {
            const box = row.childNodes[i];
            box.classList.add('invalid');
        }
    },

    markCurrentWordValid(rowNum) {
        const row = this.board.querySelectorAll(".letter-row-container").item(rowNum).querySelector(".letter-row");
        for (let i = 0; i < 5; i++) {
            const box = row.childNodes[i];
            box.classList.remove('invalid');
        }
    },

    initBoard(numNeededRows) {
        for (let i = this.board.childElementCount; i < numNeededRows; i++) {
            this.appendBoardRow();
        }
    },

    clearBoard() {
        if (!this.board) {
            console.log("No board in clearBoard!");
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
            const letterColor = COLORS[scores[i]];
            box.classList.add(`background-${ letterColor }`)
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
        box.classList.remove("filled-box", "show-lie", "show-perceived-truth");
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
                    elem.style.backgroundColor = "var(--green)";
                } else if (numHitsForEachScore[1]) {
                    elem.style.backgroundColor = "var(--yellow)";
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
        if (pressedKey === "Backspace" || pressedKey === "Del") {
            if (this.model.nextLetterPosition!== 0) {
                this.model.deleteLetter();
            } else {
                beep();
            }
        } else if (pressedKey.toLowerCase() === "enter") {
            // console.log(`pressed enter, currentTarget: ${e.currentTarget}, target: ${e.target}`);
            e.stopPropagation();
            e.cancelBubble = true;
            if (this.wordIsInvalid) {
                beep();
                return;
            }
            this.model.checkGuess();
        } else if (pressedKey.match(/^[a-z]$/i)) {
            if (this.model.nextLetterPosition === 5) {
                beep();
            } else {
                this.model.insertLetter(pressedKey.toLowerCase());
            }
        } else {
            console.log(`Lirdle: ignoring key event ${pressedKey}`);
        }
    },
    showYesterdaysWord() {
        if (!devMode()) {
            const yesterdaysWord = getYesterdaysWord();
            const yesterdaysWordElt = document.getElementById('yesterdaysWord');
            const answerStatsElt = yesterdaysWordElt.querySelector('span#answerStats');
            if (!answerStatsElt) {
                return;
            }
            yesterdaysWordElt.querySelector('span#theAnswer').textContent = yesterdaysWord;
            yesterdaysWordElt.classList.remove('hidden');
            yesterdaysWordElt.classList.add('show');
            // TODO: treat Feb 18/23 as 0 and drop all uses of the 8-digit num except to calc the position
            const currentDateNumber = getDateNumber() - 20230218 - 1;
            let failureCount = 0;
            let intervalPID = 0;
            const fetchFunc = () => {
                fetch(`stats/day${pad(currentDateNumber, 4, '0')}.json`).then((response) => {
                    return response.json();
                }).then((data) => {
                    const fractionFinished = (data.finished * 1.0) / data.started;
                    const fractionFinishedDisplay = Math.round(100 * fractionFinished);
                    const avgTriesDisplay = Math.round(100 * data.finishedDetails.average) / 100.0;
                    answerStatsElt.textContent = ` (${fractionFinishedDisplay}% finished, avg tries: ${avgTriesDisplay})`;
                }).catch((err) => {
                    console.log(`Error fetching - ${err}`);
                    failureCount += 1;
                    if (failureCount > 10) {
                        clearInterval(intervalPID);
                    }
                });
            };
            fetchFunc();
            intervalPID = setInterval(fetchFunc, 30 * 60000);
        }
    },
    showTodaysStats() {
        let numTriesNeededHere = this.model.saveableState.guessWords.length || 0;
        const todaysStatsElt = document.getElementById('todaysStats');
        const todaysPctFinishedSoFarElt = todaysStatsElt.querySelector('span#todaysPctFinishedSoFar');
        const todaysAvgSoFarElt = todaysStatsElt.querySelector('span#todaysAvgSoFar');
        let needToRevealTodaysElt = true;
        // TODO: treat Feb 18/23 as 0 and drop all uses of the 8-digit num except to calc the position
        const currentDateNumber = getDateNumber() - 20230218;
        let failureCount = 0;
        let intervalPID = 0;
        if (numTriesNeededHere === 0) {
            return;
        }
        const fetchFunc = () => {
            fetch(`stats/day${pad(currentDateNumber, 4, '0')}.json`)
            .then((response) => {
                return response.json();
            }).then((data) => {
                if (data.finished === 0) {
                    // We've got an early finisher, so assume their result hasn't been picked up yet.
                    data.finished += 1;
                    data.started += 1;
                    data.finishedDetails = {average: numTriesNeededHere};
                }
                const fractionFinished = (data.finished * 1.0) / data.started;
                const fractionFinishedDisplay = Math.round(100 * fractionFinished);
                const avgTriesDisplay = Math.round(100 * data.finishedDetails.average) / 100.0;
                todaysPctFinishedSoFarElt.textContent = fractionFinishedDisplay.toString();
                todaysAvgSoFarElt.textContent = avgTriesDisplay.toString();
                if (needToRevealTodaysElt) {
                    todaysStatsElt.classList.remove('hidden');
                    todaysStatsElt.classList.add('show');
                    needToRevealTodaysElt = false;
                }
            }).catch((err) => {
                console.log(`Error fetching - ${err}`);
                failureCount += 1;
                if (failureCount > 10) {
                    clearInterval(intervalPID);
                }
            });
	    };
        fetchFunc();
        intervalPID = setInterval(fetchFunc, 10 * 60000);
    },
    showTestimonial() {
        const currentDateNumber = getInternalDateNumber(getDateNumber());
        const currentWeekNum = pad(Math.floor(currentDateNumber / 7), 3, '0');
        const liTOTW = document.getElementById('tofw');
        const liNoTOTW = document.getElementById('no-tofw');
        if (!liTOTW || !liNoTOTW) {
            if (liNoTOTW) {
                liNoTOTW.classList.remove('hidden');
                liNoTOTW.classList.add('show');
            }
            return;
        }
        fetch(`/tease/t${ currentWeekNum }.txt`)
            .then((response) => {
                if (response.status === 200) {
                    return response.text();
                } else {
                    this.showOnOff(liNoTOTW, liTOTW);
                }
            })
            .then((txt) => {
                if (!txt || txt.length === 0) {
                    this.showOnOff(liNoTOTW, liTOTW);
                } else {
                    liTOTW.querySelector('span#tofw-body').innerHTML = this.sanitize(txt);
                    this.showOnOff(liTOTW, liNoTOTW);
                }
            }).catch((err) => {
                console.log(`Failed to process t${currentWeekNum}.txt `, err);
                this.showOnOff(liNoTOTW, liTOTW);
            });
    },
    sanitize(txt) {
        return txt.trim()
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace(/\r?\n/, '<br />');
    },
    showOnOff(onNode, offNode) {
        onNode.classList.add('show');
        onNode.classList.remove('hidden');
        offNode.classList.add('hidden');
        offNode.classList.remove('show');
    },

    doBlurbs() {
        const useragent = navigator.userAgent.toLowerCase();
        const vendor = navigator.vendor;
        const blacklist = [
            /\bipad\b/,
            /\biphone os\b/,
            /\bsamsung.*mobile safari\b/,
        ];
        if (blacklist.some(t => t.test(useragent))) {
            // do nothing
        } else if (useragent.match(/\bmozilla\b.*\bfirefox\b/)) {
            const div = document.querySelector('div#promos div.for-firefox');
            if (div) {
                div.classList.remove('hidden');
            }
        } else if (vendor.startsWith('Google') && useragent.match(/\bmozilla\b.*\bchrome\b/)) {
            const div = document.querySelector('div#promos div.for-chrome');
            if (div) {
                div.classList.remove('hidden');
            }
        }
    },
    initializeTheme(theme) {
        document.querySelector('#theme-select').value = theme;
        if (theme !== 'classic') {
            this.changeTheme(theme);
        }
    },
    changeThemeHandler(e) {
        const value = e.target.value;
        if (!['brainerd', 'butter', 'classic', 'dark', 'distractle', 'frikadeller', 'louisiana', 'pink', 'tommy'].includes(value)) {
            console.log(`Can't process theme ${ value }`);
            return;
        }
        this.changeTheme(value);
        return value;
    },
    changeTheme(theme) {
        const elts = Array.from(document.querySelectorAll('link.theme')).
        filter(elt => elt.classList.contains('theme'));
        for (const elt of elts) {
            if (elt.getAttribute('href') !== `styles/${ theme }.css`) {
                elt.parentElement.removeChild(elt);
            }
        }
        document.getElementsByTagName("head")[0].insertAdjacentHTML(
            "beforeend",
            `<link rel="stylesheet" class="theme" href="styles/${ theme }.css" />`);
    },
    updateHintCounts(values) {
        const hintsBlock = document.querySelector('div#hintsBlock');
        if (hintsBlock) {
            for (const k in values) {
                const span = hintsBlock.querySelector(`span#${k}`);
                if (span) {
                    span.textContent = values[k].toString();
                }
            }
        }
    },
    showOrHideNumLeft(checked) {
        const rowContainers = Array.from(this.board.querySelectorAll("div.letter-row-container"));
        let firstBlankRow = rowContainers.findIndex(rowContainer => !rowContainer.querySelector('.filled-box'));
        if (firstBlankRow === -1) {
            firstBlankRow = rowContainers.length;
        }

        const nodes = rowContainers.slice(0, firstBlankRow).map(rowContainer => rowContainer.querySelector('div.numWordsLeftContainer'));
        if (!nodes.length) {
            // console.log(`QQQ: selector for the num-words-left-container failed`);
            return;
        }
        const [classToShow, classToHide ] = checked ? [ 'show', 'hidden' ] : [ 'hidden', 'show' ];
        for (const node of nodes) {
            node.classList.add(classToShow);
            node.classList.remove(classToHide);
        }
    },
    showOrHideNumLeftForRow(checked, rowNum) {
        const rowContainer = this.board.querySelectorAll("div.letter-row-container").item(rowNum);
        const node = rowContainer.querySelector('div.numWordsLeftContainer');
        if (!node) {
            //console.log(`QQQ: selector for the num-words-left-container failed`);
            return;
        }
        const [classToShow, classToHide ] = checked ? [ 'show', 'hidden' ] : [ 'hidden', 'show' ];
        node.classList.add(classToShow);
        node.classList.remove(classToHide);
    },

    updateShowNumLeft(checked, rowNum, numLeft) {
        const rowContainer = this.board.querySelectorAll("div.letter-row-container").item(rowNum);
        const numWordsLeftContainer = rowContainer.querySelector('div.numWordsLeftContainer');
        const showNumLeftSpan = numWordsLeftContainer && numWordsLeftContainer.querySelector('span.numLeftAmount');
        if (!showNumLeftSpan) {
            //console.log(`QQQ: updateShowNumLeft: no span#numLeftAmount uin the last child`);
            return;
        }
        showNumLeftSpan.textContent = numLeft.toString();
    }
}

function getInternalDateNumber(dateNumber) {
    return dateNumber - 20230218;
}
