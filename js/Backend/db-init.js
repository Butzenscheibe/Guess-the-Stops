const path = require('path');
const {Database} = require('./game.js');


const query = `CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    name TEXT
);`;
async function initDBSessions(path) {
    const database = new Database(path);
    database.db.run(query, (err) => {
    if (err) {
        console.error("Error creating game_sessions table:", err.message);
        throw err;
    }
    console.log("game_sessions table is ready.");
});
}
module.exports = {initDBSessions};






