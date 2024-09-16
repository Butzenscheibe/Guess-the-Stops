const {GameTrain} = require('./game.js');
const {Database} = require('./game.js');
const gameManager = require('./gameManager.js');
const { v4: uuidv4 } = require('uuid');

const gerQuery = "select trip_id, route_id from trips where route_id in (select route_id from routes where route_type = 2 and agency_id = 27) order by random() limit 1;";
const chQuery = "select route_id from routes where route_desc in (select Abbr from transport_modes where Ref = 'Z' and Abbr not in ('TER','TGV','EXT','ZUG')) order by random() limit 1;";
let games = new Map();
function createGameID(){
    return uuidv4();

}
class STSGame{
     constructor(db, gameId, country){
        this.db = db;
        this.gameId = gameId;
        this.country = country;
        this.trainID = "";
        this.stops = [];
        this.trainName = "";
        this.shuffledStops = [];
    }
    shuffleStops(){
        let shuffledStops = [...this.stops]; // Erstellt eine Kopie von this.stops
        console.log(shuffledStops);
        for (let i = shuffledStops.length - 2; i > 0; i--) { // Startet von dem zweitletzten Element und endet nach dem ersten Element
            const j = Math.floor(Math.random() * (i - 1)) + 1; // Wählt ein zufälliges Element zwischen dem ersten und dem zweitletzten Element
            [shuffledStops[i], shuffledStops[j]] = [shuffledStops[j], shuffledStops[i]]; // Tauscht die Elemente
        }
        console.log(shuffledStops);
        return shuffledStops;
    }
}

async function createSTSGame(country){
    let dbPath = "";
    switch (country) {
        case 'de':
            dbPath = '../../database/german-db';
            break;
        case 'ch':
            dbPath = '../../database/timetable-gen';
            break;
        default:
            throw new Error("Invalid country");
    }
    let db = new Database(dbPath);
    let gameId = createGameID();
    let game = new STSGame(db.db, gameId, country);
    let [tripId, routeId] = await gameManager.selectRandTrain(gerQuery,country, db.db);
    game.trainID = tripId;
    game.stops = await gameManager.selectAllStops(game.trainID, db.db);
    game.trainName = await gameManager.getTrainNameFromDB(routeId, "de", db.db);
    game.shuffledStops = game.shuffleStops();
    games.set(gameId, game);
    return gameId;
}
function getGame(gameId){
    return games.get(gameId);
}
function deleteGame(gameId){
    games.delete(gameId);
}
function checkGame(gameId){
    return games.has(gameId);
}
function checkSolution(gameId, solution){
    let game = getGame(gameId);
    return game.stops.join() === solution.join();
}
function getShuffledStops(gameId){
    return getGame(gameId).shuffledStops;
}
function getTrainName(gameId){
    return getGame(gameId).trainName;
}

module.exports = {createSTSGame, games, getGame, deleteGame, checkGame, checkSolution, getShuffledStops, getTrainName};

