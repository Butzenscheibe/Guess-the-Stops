const path = require('path');
const fs = require('fs');

// Load .env file only if it exists (for local development)
// In Docker, environment variables are set via docker-compose.yml
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    try {
        const dotenv = require('dotenv');
        dotenv.config({ path: envPath });
    } catch (err) {
        // dotenv not available - that's fine, we'll use env vars from system
    }
}

const express = require('express');
const {
    createGame,
    checkGame,
    checkStation,
    getHint,
    checkWin,
    getGuessedStops,
    getTrainName,
    updateTime,
    updateIsRunning,
    getSolutions,
    getScore,
    deleteGame,
    archiveGame,
    saveGame,
    getTop,
    getArchiveGameFromDB,
    isRunning,
    getTime
} = require('./gameManager');
const sts = require('./sort-the-stations');
const app = express();
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

async function createGameMiddleware(req, res, next) {
    let starttime = Date.now();
    let country = req.body.country;
    let difficulty = req.body.difficulty
    let gameID = await createGame(country, difficulty, starttime);
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

app.post('/hint', (req, res) => {
    if(checkGame(req.body.gameId)) {
        let hint = getHint(req.body.gameId, req.body.hintAmount);
        res.json({result: hint});
    }
    else {
        res.json({result: false});
    }
});

app.post('/check-win', (req, res) => {
    if(checkGame(req.body.gameId)) {
        if(checkWin(req.body.gameId)) {
            let endtime = Date.now();
            updateTime(req.body.gameId, endtime);
            updateIsRunning(req.body.gameId, false);
            res.json({result: true})
        }
        else {
            res.json({result: false});
        }
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
        if(isRunning(req.body.gameId)) {
            let endtime = Date.now();
            updateTime(req.body.gameId, endtime);
            updateIsRunning(req.body.gameId, false);
            let solutions = getSolutions(req.body.gameId);
            res.json({result: solutions});
        }
        else {
            res.json({result: false});
        }
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
app.post('/save-game', (req, res) => {
    if(checkGame(req.body.gameId)) {
        let name = req.body.name;
        saveGame(req.body.gameId, name);
        res.json({result: true});
    }
    else {
        res.json({result: false});
    }
});
app.post('/get-time', (req, res) => {
    if(checkGame(req.body.gameId)) {
        if(isRunning(req.body.gameId)) {
           res.json({result: false});
        } else {
            let time = getTime(req.body.gameId);
            res.json({result: time});
        }
    }
    else {
        res.json({result: false});
    }
});
app.get('/get-top', async (req, res) => {
    let amount = req.query.amount;
    let top = await getTop(amount);
    res.json({result: top});
});
app.post('/game-data', getArchiveGameMiddleware, (req, res) => {
    res.json({result: req.game});
});

// Sort the stations

app.post('/sts/start-game', async (req, res) => {
    let country = req.body.country;
    let gameID = await sts.createSTSGame(country);
    res.json({gameId: gameID});
});
app.post('/sts/check-solution', (req, res) => {
    if(sts.checkGame(req.body.gameId)) {
        res.json({result: sts.checkSolution(req.body.gameId, req.body.solution)});
    }
    else {
        res.json({result: false});
    }
});
app.post('/sts/get-shuffled-stops', (req, res) => {
    if(sts.checkGame(req.body.gameId)) {
        res.json({result: sts.getShuffledStops(req.body.gameId)});
    }
    else {
        res.json({result: false});
    }
});
app.post('/sts/get-trainname', (req, res) => {
    if(sts.checkGame(req.body.gameId)) {
        res.json({result: sts.getTrainName(req.body.gameId)});
    }
    else {
        res.json({result: false});
    }

});
app.get('/', (req, res) => {
    res.send(req.result);
});

// Global error handler
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const PORT = process.env.PORT || 3000;

// Startup checks
console.log('=== Guess the Stops Server Startup ===');
console.log('Environment configuration:');
console.log('  PORT:', PORT);
console.log('  DB_PATH_GERMAN:', process.env.DB_PATH_GERMAN || path.join(__dirname, '../../database/german-db'));
console.log('  DB_PATH_SWISS:', process.env.DB_PATH_SWISS || path.join(__dirname, '../../database/timetable-gen'));
console.log('  DB_PATH_ARCHIVE:', process.env.DB_PATH_ARCHIVE || path.join(__dirname, '../../database/games'));

// Check if database directory exists (for Docker)
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
    console.error(`ERROR: Database directory not found at ${dbDir}`);
    console.error('For Docker deployments, ensure you have mounted the database volume correctly.');
    console.error('The docker-compose.yml should have: volumes: - ./database:/app/database');
    process.exit(1);
}

console.log('Database directory found:', dbDir);
console.log('Starting server...');

app.listen(PORT, () => {
    console.log(`✓ Server is running on port ${PORT}`);
    console.log('✓ Server is ready to accept connections');
});