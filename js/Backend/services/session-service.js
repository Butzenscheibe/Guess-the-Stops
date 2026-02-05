const {Database} = require('../game.js');
const { v4: uuidv4 } = require('uuid');

class Session {
    constructor(name) {
        this.id = uuidv4();
        this.name = name;
    }
}
class SessionService {
    constructor(dbFile) {
        this.database = new Database(dbFile);
    }
    async saveSession(session) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO game_sessions (id, name) VALUES (?, ?)`;
            this.database.db.run(query, [session.id, session.name], function(err) {
                if (err) {
                    console.error("Error saving session:", err.message);
                    return reject(err);
                }
                resolve(session.id);
            });
        });
    }
    async getSessionById(sessionId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT id, name FROM game_sessions WHERE id = ?`;
            this.database.db.get(query, [sessionId], (err, row) => {
                if (err) {
                    console.error("Error retrieving session:", err.message);
                    return reject(err);
                }
                if (row) {
                    resolve(new Session(row.name, row.id));
                } else {
                    resolve(null);
                }
            });
        });
    }
    async sessionExists(sessionId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT COUNT(*) as count FROM game_sessions WHERE id = ?`;
            this.database.db.get(query, [sessionId], (err, row) => {
                if (err) {
                    console.error("Error checking session existence:", err.message);
                    return reject(err);
                }
                resolve(row.count > 0);
            });
        });
    }
}

module.exports = { Session, SessionService };