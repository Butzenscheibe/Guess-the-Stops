const sqlite3 = require('sqlite3').verbose();
const {v4: uuidv4} = require('uuid');
const { Database, Train, GameTrain } = require('./game');

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
    constructor(gameId, country, difficulty, db) {
        this.gameId = gameId;
        this.country = country;
        this.difficulty = difficulty;
        this.db = db;
        this.train = null
        this.guesses = 0;
        this.correctGuesses = 0;
        this.score = 0.0;
        this.amountOfStations = 0;
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
        let tempScore = accuracy * difficultyMultiplier * this.correctGuesses * 100;
        this.score = Math.round(tempScore);
    }
    async startGame() {
        let query = this.buildQuery();
        let [tripId, routeId] = await this.selectRandTrain();
        let stops = await this.selectAllStops(tripId);
        if(stops.length <= 2){
            await this.startGame();
            return;
        }
        this.amountOfStations = stops.length;
        let trainName = await this.getTrainName(routeId);
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
                        query = "select trip_id, route_id from trips where route_id in (select route_id from routes where agency_id in (209, 320) ) order by random() limit 1;";
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
                    case 'hard':
                        query = "select route_id from routes where route_desc in (select Abbr from transport_modes where Ref = 'Z' and Abbr not in ('TER','TGV','EXT','ZUG')) order by random() limit 1;";
                        break;
                    default:
                        throw new Error("Invalid difficulty level");
                }
        }
        return query;
    }
    async selectRandTrain() {
        let query = this.buildQuery();
        let result;

        if (this.country === 'de') {
            result = await new Promise((resolve, reject) => {
                this.db.get(query, (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve([row.trip_id, row.route_id]);
                    }
                });
            });
        } else {
            let id = await new Promise((resolve, reject) => {
                this.db.get(query, (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row.route_id);
                    }
                });
            });

            let randTrainSql = "select trip_id, route_id from trips where route_id = ? order by random() limit 1;";
            result = await new Promise((resolve, reject) => {
                this.db.get(randTrainSql, [id], (err, row) => {
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
    async selectAllStops(trainId) {
        let stops = [];
        let stopIdsSql = "SELECT stop_id FROM stop_times WHERE trip_id = ?";
        let stopIds = await new Promise((resolve, reject) => {
            this.db.all(stopIdsSql, [trainId], (err, rows) => {
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
                this.db.get(stopSql, [stopId], (err, row) => {
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
    async getTrainName(routeId) {
        let sql;
        switch (this.country) {
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
            this.db.get(sql, [routeId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (this.country === 'ch') {
                        resolve(row.route_short_name + ' (' + row.route_desc + ')');
                    } else {
                        resolve(row.route_short_name);
                }
            }
            });
        });
    
        return trainName;
    }
}


let games = new Map();
function createGameID(){
    return uuidv4();

}

async function createGame(country, difficulty) {
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
    let game = new Game(gameId, country, difficulty, db.db);
    games.set(gameId, game);
    console.log('Game created with ID:', gameId);
    await game.startGame();
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
    return game.score;
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

module.exports = { Game, games, createGame, getGame, checkGame, deleteGame, checkStation, getGuessedStops, getTrainName, checkWin, getSolutions, getScore, archiveGame, getArchiveGameFromDB};