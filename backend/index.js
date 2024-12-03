const express = require('express');
require('dotenv').config(); // For input validation
const winston = require('winston'); // For structured logging
const routes = require("./routes");

const app = express();
app.use(express.json()); // For parsing JSON bodies

const port = 3003;

// Logger setup using Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' }), // Logs to a file
    ],
});

// Use routes
app.use("/", routes);

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await db.end();
        logger.info('Database connection closed.');
    } catch (err) {
        logger.error('Error closing database connection:', err.message);
    } finally {
        process.exit();
    }
});

// Start the server
app.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`);
});