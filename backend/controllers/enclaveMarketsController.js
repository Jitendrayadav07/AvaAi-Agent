const crypto = require('crypto');
const https = require('https');
const mysql = require('mysql2/promise'); // Using promise-based MySQL
const { format } = require('date-fns');
require('dotenv').config();
const { validationResult } = require('express-validator'); // For input validation
const winston = require('winston'); // For structured logging

// Logger setup using Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' }), // Logs to a file
    ],
});

// Validate environment variables
const apiKey = process.env.APIKEY;
const apiSecret = process.env.APISECRET;

if (!apiKey || !apiSecret) {
    logger.error('API credentials are missing. Check your .env file.');
    process.exit(1);
}

// MySQL database connection pool
const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT,
});


// Utility function to make API requests
function makeRequest(method, path, body = '') {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now().toString();
        const concattedString = timestamp + method + path + body;

        // Generate HMAC signature
        const hmac = crypto.createHmac('sha256', apiSecret);
        hmac.update(concattedString);
        const signature = hmac.digest('hex');

        const options = {
            hostname: 'api-sandbox.enclave.market',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'ENCLAVE-KEY-ID': apiKey,
                'ENCLAVE-TIMESTAMP': timestamp,
                'ENCLAVE-SIGN': signature,
            },
        };

        const apiReq = https.request(options, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                logger.info('Raw Response:', data); // Log raw response
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (err) {
                    logger.error('Error parsing JSON:', err);
                    reject(new Error(`Invalid JSON response: ${data}`));
                }
            });
        });

        apiReq.on('error', (error) => {
            logger.error('Request error:', error.message);
            reject(error);
        });

        if (body) {
            apiReq.write(body);
        }
        apiReq.end();
    });
}

// Function to create a market order
async function createPerpsMarketOrder(market, side, size) {
    const path = '/v1/perps/orders';
    const body = JSON.stringify({
        market: market,
        side: side,
        size: size.toString(),
        type: 'market',
    });

    try {
        const response = await makeRequest('POST', path, body);
        return response;
    } catch (err) {
        logger.error('Error creating market order:', err.message);
        throw err;
    }
}

// Function to fetch orders for a specific market
async function getOrders(orderId) {
    const path = `/v1/perps/orders/${orderId}`;

    try {
        const response = await makeRequest('GET', path);
        return response;
    } catch (err) {
        logger.error('Error fetching orders:', err.message);
        throw err;
    }
}


const placeOrder = async (req, res) => {
    try {
        // Validation check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const market = 'AVAX-USD.P'; 
        const side = req.body.order_type.toLowerCase();
        const size = req.body.size; // Adjust size as needed

        // Create the market order
        const orderResponse = await createPerpsMarketOrder(market, side, size);
        logger.info('Order placed successfully:', orderResponse);

        const parseDateTime = (isoString) => format(new Date(isoString), 'yyyy-MM-dd HH:mm:ss');

        const insertQuery = `INSERT INTO tbl_orders_data(orderId, side, price, size, market, filledSize, filledCost, fee, status, createdAt, filledAt, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.query(insertQuery, [
            orderResponse.result.orderId,
            orderResponse.result.side,
            orderResponse.result.price,
            orderResponse.result.size,
            orderResponse.result.market,
            orderResponse.result.filledSize,
            orderResponse.result.filledCost,
            orderResponse.result.fee,
            orderResponse.result.status,
            parseDateTime(orderResponse.result.createdAt),
            parseDateTime(orderResponse.result.filledAt),
            orderResponse.result.type,
        ]);

        logger.info('Data inserted successfully, ID:', result.insertId);
        res.status(201).send(orderResponse);
    } catch (error) {
        logger.error('Error placing order:', error.message);
        res.status(500).send({ error: error.message });
    }
};

const getAllOrders = async (req, res) => {
     try {
        const query = `SELECT * FROM tbl_orders_data`;
        const [results] = await db.query(query);

        logger.info('Orders fetched successfully:', results);
        res.status(200).send(results);
    } catch (error) {
        logger.error('Error fetching orders from the database:', error.message);
        res.status(500).send({ error: 'Failed to fetch orders from database' });
    }
}

const getOrderById = async (req, res) => {
     try {
        const orderId = req.params.orderId;

        // Fetch orders from the API
        const ordersResponse = await getOrders(orderId);

        logger.info('Orders fetched successfully:', ordersResponse);

        // Send the fetched orders as a response
        res.status(200).send(ordersResponse);
    } catch (error) {
        logger.error('Error fetching orders:', error.message);
        res.status(500).send({ error: error.message });
    }
}

module.exports = {
    placeOrder,
    getAllOrders,
    getOrderById
};

