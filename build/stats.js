// Copyright (C) 2023 Bovination Productions, MIT License

export default function Stats() {
}

Stats.prototype = {
    initialize(currentStats) {
        let reinit = true;
        try {
            if (currentStats) {
                Object.assign(this, this.migrate(currentStats));
                reinit = this.totalFinishedGames === 0 && this.totalUnfinishedGames === 0;
            }
        } catch { }
        if (reinit) {
            this.totalFinishedGuesses = 0;
            this.totalFinishedGames = 0;
            this.lowestScore = 1_000_000;
            this.highestScore = -1;
            this.totalUnfinishedGuesses = 0;
            this.totalUnfinishedGames = 0;
        }
    },
    migrate(oldStats) {
        if (!('data' in oldStats) || !('totalGames' in oldStats.data)) {
            return oldStats;
        }
        return {
            version: 2,
            totalFinishedGames: oldStats.data.totalFinishedGames ?? 0,
            totalFinishedGuesses: oldStats.data['totalGuesses'] ?? 0,
            totalUnfinishedGames: oldStats.data.totalUnfinishedGames ?? 0,
            totalUnfinishedGuesses: oldStats.data.totalUnfinishedGuesses ?? 0,
            lowestScore: oldStats.data.lowestScore ?? 0,
            highestScore: oldStats.data.highestScore ?? 0
        };
    },
    addFinishedGame(numGuesses) {
        this.totalFinishedGuesses += numGuesses;
        this.totalFinishedGames += 1;
        if (this.lowestScore > numGuesses) {
            this.lowestScore = numGuesses;
        }
        if (this.highestScore < numGuesses) {
            this.highestScore = numGuesses;
        }
    },
    addUnfinishedGame(numGuesses) {
        this.totalUnfinishedGuesses += numGuesses;
        this.totalUnfinishedGames += 1;
    },
    getStatsSummary() {
        const lines = ['<h3>Current Stats</h3>'];
        if (this.totalFinishedGames > 0) {
            lines.push(`Games finished: ${ this.totalFinishedGames }`);
            lines.push(`Average #tries: ${ this.round2(this.totalFinishedGuesses /this.totalFinishedGames) }`);
            lines.push(`Fewest tries needed: ${ this.lowestScore }`);
            lines.push(`Most tries needed: ${ this.highestScore }`);
        } else {
            lines.push(`No games finished yet`);
        }
        if (this.totalUnfinishedGames > 0) {
            lines.push(`Games you forgot to finish: ${ this.totalUnfinishedGames }`);
            lines.push(`Average #tries before stopping: ${ this.round2(this.totalUnfinishedGuesses /this.totalUnfinishedGames) }`);
        } else {
            lines.push(`Congratulations! You've gotten them all so far!`);
        }
        return lines.join(' <br> \n');
    },
    round2(n) {
        return Math.floor(n) === n ? n : (Math.round(n * 100) / 100);
    }
};