const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor(dbFile) {
        this.db = new sqlite3.Database(dbFile, (err) => {
            if (err) {
                return console.error(err.message);
            }
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
        this.stops = this.stops.map(stop => prepareStop(stop));
        this.stops = [...new Set(this.stops)]
    }
}
function prepareStop(stop){
    stop = stop.replace(',', ' ');
    stop = stop.replace('-', ' ');
    stop = stop.replace("ß", "ss");
    stop = stop.replace(/Gl\.\d+ .*/, ' ');
    stop = stop.replace(/-?>.*/, ' ');
    stop = stop.replace(/[a-zA-Z]{3}stieg/, ' ');
    stop = stop.replace(/Bstggl\.[0-9]/, ' ');
    stop = stop.replace(/([MU]\d+\+*)+/, ' ');
    stop = stop.replace(/\(.*\)/, ' ');
    stop = stop.replace(/ +/, ' ');
    stop = stop.replace(/ $/, '');
    return stop;
}

module.exports = { Database, Train, GameTrain, prepareStop };