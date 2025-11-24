const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class Database {
    constructor(dbFile) {
        // Check if database file exists
        if (!fs.existsSync(dbFile)) {
            const error = new Error(`Database file not found: ${dbFile}\n` +
                `Please ensure the database file exists at this location.\n` +
                `For Docker deployments, make sure the database files are in the ./database directory on the host.`);
            console.error(error.message);
            throw error;
        }
        
        this.db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(`Error opening database at ${dbFile}:`, err.message);
                throw err;
            }
            console.log(`Connected to database: ${dbFile}`);
        });
    }
}

class Train {
    constructor(trainId, routeId, trainName, stops) {
        this.routeId = routeId;
        this.trainId = trainId;
        this.trainName = trainName;
        this.stops = stops;
    }
}

class GameTrain extends Train {
    constructor(trainId, routeId, trainName, stops) {
        super(trainId, routeId, trainName, stops);
        this.editStop();
        this.guessedStops = this.createGuessedStops();
    }

    createGuessedStops() {
        let guessedStops = this.stops.map(stop => "X".repeat(stop.length));
        guessedStops[0] = this.stops[0];
        guessedStops[guessedStops.length - 1] = this.stops[this.stops.length - 1];
        return guessedStops;
    }

    editStop() {
        this.stops = this.stops.map(stop => {
            stop = stop.replace(',', ' ');
            stop = stop.replace(/Gl\.\d+ .*/, ' ');
            stop = stop.replace(/-?>.*/, ' ');
            stop = stop.replace(/[a-zA-Z]{3}stieg/, ' ');
            stop = stop.replace(/Bstggl\.[0-9]/, ' ');
            stop = stop.replace(/([MU]\d+\+*)+/, ' ');
            stop = stop.replace(/\(.*\)/, ' ');
            stop = stop.replace(/ +/, ' ');
            stop = stop.replace(/ $/, '');
            return stop;
        });
        this.stops = [...new Set(this.stops)]
    }
}

module.exports = { Database, Train, GameTrain };