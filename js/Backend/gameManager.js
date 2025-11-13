const sqlite3 = require('sqlite3').verbose();
const {v4: uuidv4} = require('uuid');
const { Database, Train, GameTrain, prepareStop } = require('./game');

const archiveDB = "../../database/games";
let archiveGames = new Map();


class ArchiveGame {
    constructor(gameId, game){
        this.gameId = gameId;
        this.game = game;
        this.guesses = [];
        this.correctGuesses = [];
    }

}
function createArchiveGame(gameId, train){
    let archiveGame = new ArchiveGame(gameId, train);
    archiveGames.set(gameId, archiveGame);
    console.log('Archive Game created with ID:', gameId);
}
function getArchiveGame(gameId){
    return archiveGames.get(gameId);
}

class Game {
    constructor(gameId, country, difficulty, starttime, db) {
        this.gameId = gameId;
        this.country = country;
        this.difficulty = difficulty;
        this.db = db;
        this.train = null
        this.guesses = 0;
        this.correctGuesses = 0;
        this.score = 0.0;
        this.unDeducedScore = 0.0;
        this.amountOfStations = 0;
        this.hintAmount = 0;
        this.starttime = starttime;
        this.time = 0;
        this.running = true;
    }
    updateScore() {
        let accuracy = this.correctGuesses / this.guesses;
        let difficultyMultiplier = 1;
        switch (this.difficulty) {
            case 'easy':
                difficultyMultiplier = 1;
                break;
            case 'medium':
                difficultyMultiplier = 1.5;
                break;
            case 'hard':
                difficultyMultiplier = 2;
                break;
        }
        let hintDeduction = this.hintAmount * 0.2;
        if(hintDeduction > 1){
            hintDeduction = 1;
        }
        let tempScore = accuracy * difficultyMultiplier * this.correctGuesses * 100;
        this.unDeducedScore = tempScore;
        hintDeduction = tempScore * hintDeduction;
        tempScore -= hintDeduction;
        this.score = Math.round(tempScore);
        this.unDeducedScore = Math.round(this.unDeducedScore);
    }
    async startGame() {
        let query = this.buildQuery();
        let [tripId, routeId] = await selectRandTrain(query, this.country, this.db);
        let stops = await selectAllStops(tripId, this.db);
        if(stops.length <= 2){
            await this.startGame();
            return;
        }
        this.amountOfStations = stops.length;
        let trainName = await getTrainNameFromDB(routeId, this.country, this.db);
        console.log('Train:', trainName);
        this.train = new GameTrain(tripId, routeId, trainName, stops);
        createArchiveGame(this.gameId, this);
    }
    async startGameWithSpecificStop(stop) {
        let [tripId, routeId] = await selectRandTrainWithSpecificStop(this.country, this.db, stop);
        let stops = await selectAllStops(tripId, this.db);
        if(stops.length <= 2){
            await this.startGameWithSpecificStop(stop);
            return;
        }
        this.amountOfStations = stops.length;
        let trainName = await getTrainNameFromDB(routeId, this.country, this.db);
        console.log('Train:', trainName);
        this.train = new GameTrain(tripId, routeId, trainName, stops);
        createArchiveGame(this.gameId, this);
    }
    buildQuery() {
        let query;
        switch (this.country) {
            case 'de':
                switch (this.difficulty) {
                    case 'easy':
                        query = "select trip_id, route_id from trips where route_id in (select route_id from routes where route_type = 2 and agency_id = 27) order by random() limit 1;";
                        break;
                    case 'medium':
                        query = "select trip_id, route_id from trips where route_id in (select route_id from routes where route_type = 2 and agency_id not in (148, 100, 122, 161, 79, 9, 302, 320)) order by random() limit 1;";
                        break;
                    case 'hard':
                        query = "select trip_id, route_id from trips where route_id in (select route_id from routes where agency_id in (75) and route_type = 1 ) order by random() limit 1;";
                        break;
                    default:
                        throw new Error("Invalid difficulty level");
                }
                break;
            default:
                switch (this.difficulty) {
                    case 'easy':
                        query = "select route_id from routes where route_desc = 'IC' and agency_id = 11 order by random() limit 1;";
                        break;
                    case 'medium':
                        query = "select route_id from routes where route_desc in (select Abbr from transport_modes where Ref = 'Z' and Abbr not in ('TER','TGV','EXT','ZUG')) order by random() limit 1;";
                        break;
                    case 'hard':
                        query = "select route_id from routes where agency_id = 881 order by random() limit 1;";
                        break;
                    default:
                        throw new Error("Invalid difficulty level");
                }
        }
        return query;
    }
}


let games = new Map();
function createGameID(){
    return uuidv4();

}

async function getTrainNameFromDB(routeId, country, db) {
    let sql;
    switch (country) {
        case 'ch':
            sql = "SELECT route_short_name, route_desc FROM routes WHERE route_id = ?";
            break;
        case 'de':
            sql = "SELECT route_short_name FROM routes WHERE route_id = ?";
            break;
        default:
            throw new Error('Invalid detail level');
    }


    let trainName = await new Promise((resolve, reject) => {
        db.get(sql, [routeId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (country === 'ch') {
                    resolve(row.route_short_name + ' (' + row.route_desc + ')');
                } else {
                    resolve(row.route_short_name);
            }
        }
        });
    });
    return trainName;
}
async function selectRandTrain(query, country, db) {
    let result;

    if (country === 'de') {
        result = await new Promise((resolve, reject) => {
            db.get(query, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve([row.trip_id, row.route_id]);
                }
            });
        });
    } else {
        let id = await new Promise((resolve, reject) => {
            db.get(query, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.route_id);
                }
            });
        });

        let randTrainSql = "select trip_id, route_id from trips where route_id = ? order by random() limit 1;";
        result = await new Promise((resolve, reject) => {
            db.get(randTrainSql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve([row.trip_id, row.route_id]);
                }
            });
        });
    }

    return result;
}
async function selectRandTrainWithSpecificStop(country, db, stop) {
    let result;
    let query;
    switch (country) {
        case 'de':
            query = "select trip_id, route_id from trips where route_id in (select route_id from routes where route_type = 2) and trip_id in (select trip_id from stop_times where stop_id = ? or stop_id in (select stop_id from stops where parent_station = ?)) order by random() limit 1;";
            break;
        case 'ch':
            query = "select route_id from routes where route_desc in (select Abbr from transport_modes where Ref = 'Z' and Abbr not in ('TER','TGV','EXT','ZUG')) order by random() limit 1;";
            break;
        default:
            throw new Error("Invalid country");
    }
    try {

        result = await new Promise((resolve, reject) => {
            db.get(query, [stop, stop], (err, row) => {
                if (err) {
                    console.log("TESTTEST")
                    reject(err);
                } else {
                    if (row === undefined) {
                        reject(new Error("No train found"));
                    } else {
                        resolve([row.trip_id, row.route_id]);
                    
                    }   
                }
            });
        });
    } catch (err) {
        throw err;
    }
    return result;
}
async function selectAllStops(trainId, db) {
    let stops = [];
    let stopIdsSql = "SELECT stop_id FROM stop_times WHERE trip_id = ?";
    let stopIds = await new Promise((resolve, reject) => {
        db.all(stopIdsSql, [trainId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => row.stop_id));
            }
        });
    });

    for (let stopId of stopIds) {
        let stopSql = "SELECT stop_name FROM stops WHERE stop_id = ?";
        let stop = await new Promise((resolve, reject) => {
            db.get(stopSql, [stopId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.stop_name);
                }
            });
        });
        stops.push(stop);
    }

    return stops;
}

async function createGame(country, difficulty, starttime) {
    let gameId = createGameID();
    let db_path = ''
    switch (country) {
        case 'de':
            db_path = '../../database/german-db';
            break;
        case 'ch':
            db_path = '../../database/timetable-gen';
            break;
        default:
            throw new Error("Invalid country");
    }
    let db = new Database(db_path);
    let game = new Game(gameId, country, difficulty, starttime, db.db);
    games.set(gameId, game);
    console.log('Game created with ID:', gameId);
    await game.startGame();
    return gameId;
}
async function createGameWithSpecificStop(country, starttime, stop) {
    let gameId = createGameID();
    let db_path = ''
    switch (country) {
        case 'de':
            db_path = '../../database/german-db';
            break;
        case 'ch':
            db_path = '../../database/timetable-gen';
            break;
        default:
            throw new Error("Invalid country");
    }
    let db = new Database(db_path);
    let game = new Game(gameId, country, 'easy', starttime, db.db);
    games.set(gameId, game);
    console.log('Game created with ID:', gameId);
    await game.startGameWithSpecificStop(stop);
    return gameId;
}
function getGame(gameId) {
    return games.get(gameId);
}
function checkGame(gameId) {
    return games.has(gameId);
}
function deleteGame(gameId) {
    games.delete(gameId);
    archiveGames.delete(gameId);
}
function checkStation(gameId, station) {
    let game = getGame(gameId);
    let archiveGame = getArchiveGame(gameId);
    if(game.train.stops.includes(station) && !game.train.guessedStops.includes(station)) {
        let index = game.train.stops.indexOf(station);
        game.train.guessedStops[index] = station;
        game.correctGuesses++;
        game.guesses++;
        archiveGame.correctGuesses.push(station);
        archiveGame.guesses.push(station);
        return true;
    }
    game.guesses++;
    archiveGame.guesses.push(station);
    return false;
}
function getGuessedStops(gameId) {
    let game = getGame(gameId);
    return game.train.guessedStops;
}
function getTrainName(gameId) {
    let game = getGame(gameId);
    return game.train.trainName;
}
function checkWin(gameId) {
    let game = getGame(gameId);
    game.updateScore();
    return game.train.stops.every((stop, index) => stop === game.train.guessedStops[index]);
}
function getSolutions(gameId) {
    let game = getGame(gameId);
    game.updateScore();
    return game.train.stops;
}
function getScore(gameId) {
    let game = getGame(gameId);
    game.updateScore();
    if(!game.score){
        game.score = 0;
    }
    if(!game.unDeducedScore){
        game.unDeducedScore = 0;
    }
    let scoreObj = {
        score: game.score,
        unDeducedScore: game.unDeducedScore,
    };
    return scoreObj;
}

async function insertArchiveIntoDB(id, data){
    let db = new sqlite3.Database(archiveDB, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });
    let sql = `INSERT INTO games (id, data_json) VALUES (?, ?)`;
    db.run(sql, [id, data], function(err) {
        if (err) {
            return console.error(err.message);
        }
    });
    db.close();
}
function archiveGame(gameId){
    let archiveGame = getArchiveGame(gameId);
    let data = JSON.stringify(archiveGame);
    insertArchiveIntoDB(gameId, data);
}
async function getArchiveGameFromDB(gameId){
    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database(archiveDB, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
        });

        let sql = `SELECT data_json FROM games WHERE id = ?`;
        db.get(sql, [gameId], (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            db.close();
            if(row){
                resolve(JSON.parse(row.data_json));
            } else {
                resolve(false);
            }
        });
    });
}
function getHint(gameId, hintAmount){
    let game = getGame(gameId);
    let stops = game.train.stops;
    let guessedStops = game.train.guessedStops;
    for(let i = 1; i < guessedStops.length - 1; i++){
        let startLetter = stops[i][hintAmount];
        guessedStops[i] = guessedStops[i].split('').map((letter, index) => {
            if(index === hintAmount){
                return startLetter;
            }
            return letter;
        }).join('');
    }
    game.hintAmount++;
    game.train.guessedStops = guessedStops;
    return guessedStops;
}
function saveGame(gameId, name){
    let score = getScore(gameId).score;
    insertSavedGameIntoDB(gameId, name, score);

}
function updateTime(gameId, endtime){
    let game = getGame(gameId);
    game.time = endtime - game.starttime;
}
function insertSavedGameIntoDB(id, name, score){
    let db = new sqlite3.Database(archiveDB, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });
    let sql = `INSERT INTO scores(id, name, score) VALUES (?, ?, ?)`;
    db.run(sql, [id, name, score], function(err) {
        if (err) {
            return console.error(err.message);
        }
    });
    db.close();
}
async function getStopID(stop){
    let db = new sqlite3.Database('../../database/german-db', (err) => {
        if (err) {
            console.error(err.message);
            reject(err);
        }
    });
    let result = -1;
    let sql = `SELECT parentFROM stops`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            reject(err);
        }
        rows.forEach((row) => {
            if (row === undefined) {
                return result;
            }
            if (row.stopId === undefined) {
                return result;
            }
            if(prepareStop(row.stop_id) === stop){
                result = row.stop_id;
            }
        });
    });
    return result;

}
async function getTop(amount){
    if(!amount){
        amount = 10;
    }
    if(amount > 10){
        amount = 10;
    }
    if(amount < 1){
        amount = 1;
    }
    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database(archiveDB, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
        });

        let sql = `SELECT id, name, score FROM scores ORDER BY score DESC LIMIT ?`;
        db.all(sql, [amount], (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            db.close();
            resolve(rows);
        });
    });
}
function updateIsRunning(gameId, isRunning){
    let game = getGame(gameId);
    game.running = isRunning;
}
function isRunning(gameId){
    let game = getGame(gameId);
    return game.running;
}
function getTime(gameId){
    let game = getGame(gameId);
    return game.time;
}
module.exports = {
    createGame,
    createGameWithSpecificStop,
    checkStation,
    getGuessedStops,
    getTrainName,
    checkWin,
    getSolutions,
    getScore,
    deleteGame,
    getGame,
    getHint,
    saveGame,
    updateTime,
    getTop,
    archiveGame,
    getArchiveGameFromDB,
    updateIsRunning,
    isRunning,
    checkGame,
    getTime,
    getStopID
};