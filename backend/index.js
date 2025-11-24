const path = require('path');
const fs = require('fs');

// Load .env file only if it exists (for local development)
// In Docker, environment variables are set via docker-compose.yml
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    try {
        const dotenv = require('dotenv');
        dotenv.config({ path: envPath });
    } catch (err) {
        // dotenv not available - that's fine, we'll use env vars from system
    }
}

const express = require('express');
const cors = require('cors');
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

// CORS configuration for frontend-backend communication
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

async function createGameMiddleware(req, res, next) {
    try {
        let starttime = Date.now();
        let country = req.body.country;
        let difficulty = req.body.difficulty;
        let gameID = await createGame(country, difficulty, starttime);
        req.gameID = gameID;
        next();
    } catch (err) {
        console.error('Error creating game:', err.message);
        res.status(500).json({ 
            error: 'Failed to create game', 
            message: err.message,
            hint: 'Make sure database files exist in the database directory'
        });
    }
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
// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'Guess the Stops API',
        version: '1.0.0'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
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

const dbPathGerman = process.env.DB_PATH_GERMAN || path.join(__dirname, '../database/german-db');
const dbPathSwiss = process.env.DB_PATH_SWISS || path.join(__dirname, '../database/timetable-gen');
const dbPathArchive = process.env.DB_PATH_ARCHIVE || path.join(__dirname, '../database/games');

console.log('  DB_PATH_GERMAN:', dbPathGerman);
console.log('  DB_PATH_SWISS:', dbPathSwiss);
console.log('  DB_PATH_ARCHIVE:', dbPathArchive);

// Check if database directory exists (for Docker)
/* const dbDir = path.join(__dirname, '../database');
console.log('\nChecking database directory:', dbDir);
if (!fs.existsSync(dbDir)) {
    console.error('ERROR: Database directory not found at', dbDir);
    console.error('For Docker: Make sure you have a "database" directory on your host');
    console.error('The docker-compose.yml mounts: ./database:/app/database');
    process.exit(1);
}
console.log('✓ Database directory exists'); */

// Check for required database files
console.log('\nChecking for database files...');
const requiredDatabases = [
    { name: 'German railway DB', path: dbPathGerman },
    { name: 'Swiss railway DB', path: dbPathSwiss }
];

let missingDatabases = [];
for (const db of requiredDatabases) {
    if (fs.existsSync(db.path)) {
        console.log(`  ✓ ${db.name}: ${db.path}`);
    } else {
        console.error(`  ✗ ${db.name}: NOT FOUND at ${db.path}`);
        missingDatabases.push(db);
    }
}

// Check archive database (create if doesn't exist)
if (!fs.existsSync(dbPathArchive)) {
    console.log(`  ! Archive DB will be created on first use: ${dbPathArchive}`);
} else {
    console.log(`  ✓ Archive DB: ${dbPathArchive}`);
}

if (missingDatabases.length > 0) {
    console.error('\n❌ ERROR: Missing required database files!');
    console.error('\nYou need to place the following files in your database directory:');
    for (const db of missingDatabases) {
        console.error(`  - ${path.basename(db.path)}`);
    }
    console.error('\nFor Docker:');
    console.error('  1. Create a "database" directory on your host (where docker-compose.yml is)');
    console.error('  2. Place the database files in that directory');
    console.error('  3. The files will be accessible at /app/database/ inside the container');
    console.error('\nExpected structure:');
    console.error('  ./database/german-db');
    console.error('  ./database/timetable-gen');
    console.error('  ./database/games (created automatically)');
    process.exit(1);
}

console.log('\n✓ All required database files found');
console.log('Starting server...\n');

const server = app.listen(PORT, () => {
    console.log(`✓ Server is running on port ${PORT}`);
    console.log('✓ Server is ready to accept connections');
    console.log('Process PID:', process.pid);
    console.log('Node version:', process.version);
    
    // Log that we're staying alive
    setInterval(() => {
        console.log('[Heartbeat] Server still running...', new Date().toISOString());
    }, 30000); // Log every 30 seconds
});

console.log('[DEBUG] After app.listen() call');

// Keep the server alive
server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});

server.on('listening', () => {
    console.log('[DEBUG] Server listening event fired');
});

server.on('close', () => {
    console.log('[DEBUG] Server close event fired');
});

// Handle termination signals gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('exit', (code) => {
    console.log('[DEBUG] Process exit event with code:', code);
});

console.log('[DEBUG] End of index.js file reached');