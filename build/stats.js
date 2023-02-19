export default function Stats() {
    this.data = {};
}

Stats.prototype = {
    initialize(currentStats) {
        if (currentStats) {
            this.data = currentStats;
        } else {
            this.data = {};
            this.data.totalGames = 0;
            this.data.totalFinishedGames = 0;
            this.data.totalGuesses = 0;
            this.data.runningAvg = 0;
            this.data.lowestScore = 1_000_000;
            this.data.highestScore = -1;
            this.data.totalUnfinishedGames = 0;
            this.data.totalUnfinishedGuesses = 0;
            this.data.runningUnfinishedAvg = 0;
        }
    },
    addFinishedGame(numGuesses) {
        this.data.totalGames += 1;
        this.data.totalFinishedGames += 1;
        this.data.totalGuesses += numGuesses;
        this.data.runningAvg = this.data.totalGuesses / this.data.totalFinishedGames;
        if (this.data.lowestScore > numGuesses) {
            this.data.lowestScore = numGuesses;
        }
        if (this.data.highestScore < numGuesses) {
            this.data.highestScore = numGuesses;
        }
    },
    addUnfinishedGame(tries) {
        this.data.totalGames += 1;
        this.data.totalUnfinishedGames += 1;
        this.data.totalUnfinishedGuesses += numGuesses;
        this.data.runningUnfinishedAvg = this.data.totalUnfinishedGuesses / this.data.totalUnfinishedGames;
    },
};