const express = require('express');
const {createGame, checkGame, getGuessedStops, getTrainName, checkStation, checkWin, getSolutions, deleteGame, getScore, archiveGame, getArchiveGameFromDB} = require('./gameManager');
const path = require('path');
const app = express();
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

async function createGameMiddleware(req, res, next) {
    let country = req.body.country;
    let difficulty = req.body.difficulty
    let gameID = await createGame(country, difficulty);
    req.gameID = gameID;
    next();
}
async function getArchiveGameMiddleware(req, res, next) {
    let gameID = req.body.gameId;
    let game = await getArchiveGameFromDB(gameID);
    if(game) {
        req.game = game;
        next();
    }
    else {
        req.game = false;
    }
    next();
}


app.post('/start-game', createGameMiddleware, (req, res) => {
    res.json({gameId: req.gameID});
});
app.post('/check-station', (req, res) => {
    if(checkGame(req.body.gameId)) {
        res.json({result: checkStation(req.body.gameId, req.body.station)});
    }
    else {
        res.json({result: false});
    }
    
});

app.post('/check-win', (req, res) => {
    if(checkGame(req.body.gameId)) {
        res.json({result: checkWin(req.body.gameId)});
    }
    else {
        res.json({result: false});
    }
});

app.post('/get-guessed-stops',  (req, res) => {
    if(checkGame(req.body.gameId)) {
        res.json({result: getGuessedStops(req.body.gameId)});
    }
    else {
        res.json({result: false});
    }
});
app.post('/get-train-name', (req, res) => {
    if(checkGame(req.body.gameId)) {
        res.json({result: getTrainName(req.body.gameId)});
    }
    else {
        res.json({result: false});
    }
});
app.post('/cancel-game', (req, res) => {
    if(checkGame(req.body.gameId)) {
        let solutions = getSolutions(req.body.gameId);
        res.json({result: solutions});
    }
    else {
        res.json({result: false});
    }
});
app.post('/get-score', (req, res) => {
    if(checkGame(req.body.gameId)) {
        let score = getScore(req.body.gameId);
        res.json({result: score});
    }
    else {
        res.json({result: false});
    }
});
app.post('/delete-game', (req, res) => {
    if(checkGame(req.body.gameId)) {
        deleteGame(req.body.gameId);
        res.json({result: true});
    }
    else {
        res.json({result: false});
    }
});
app.post('/archive-train', (req, res) => {
    if(checkGame(req.body.gameId)) {
        archiveGame(req.body.gameId);
        res.json({result: true});
    }
    else {
        res.json({result: false});
    }
});
app.post('/game-data', getArchiveGameMiddleware, (req, res) => {
    res.json({result: req.game});
});

app.get('/', (req, res) => {
    res.send(req.result);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});