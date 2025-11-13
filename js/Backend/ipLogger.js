const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, 'logs');
const logFile = path.join(logDir, 'ip-access.log');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Get client IP address from request
 * Handles proxies and common headers
 */
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.headers['x-real-ip'] ||
           req.socket.remoteAddress ||
           req.connection.remoteAddress ||
           'unknown';
}

/**
 * Middleware to log IP addresses accessing the application
 */
function ipLoggerMiddleware(req, res, next) {
    const ip = getClientIP(req);
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Create log entry
    const logEntry = `${timestamp} | IP: ${ip} | ${method} ${url} | User-Agent: ${userAgent}\n`;
    
    // Append to log file asynchronously
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error('Error writing to IP log:', err);
        }
    });
    
    next();
}

module.exports = {
    ipLoggerMiddleware,
    getClientIP
};
