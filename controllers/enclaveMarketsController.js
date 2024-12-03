const express = require('express');
const crypto = require('crypto');
const https = require('https');
const mysql = require('mysql2/promise'); // Using promise-based MySQL
const { format } = require('date-fns');
require('dotenv').config();
const { body, validationResult } = require('express-validator'); // For input validation
const winston = require('winston'); // For structured logging
const axios = require('axios');


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

async function fetchDextoolsData() {
    const url = 'https://www.dextools.io/shared/data/pair?address=0xd446eb1660f766d533beceef890df7a69d26f7d1&chain=avalanche&audit=false&locks=true';

    const headers = {
        'accept': 'application/json',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'cookie': '__cf_bm=G..3lsPrCe8ZYGMA.pkbSOS2zfBPCNvaRjukUITJ0.Q-1733046992-1.0.1.1-8BGqubhOZ5ANZl7uJcByY5ejpf9Lg9fYp7BchJE8nLLM6JnmYbqDYgGhnQX0iNChOJVWT1ekma9k7HmnaDYpgA; _pk_id.1.b299=eb998a4c1875aba9.1733047005.; _pk_ses.1.b299=1; _pk_id.5.b299=01c3b9b4963e4b9d.1733047005.; _pk_ses.5.b299=1; cookieyes-consent=consentid:UlBWMnZmQmVaSkxhcVkxQ3FjcFBZYXRiODVMWVpIdkY,consent:yes,action:no,necessary:yes,functional:yes,analytics:yes,performance:yes,advertisement:yes,other:yes; cf_clearance=Ltyksozm3aJMDg4GhzP31myWXGUvEHSZIoCNaRWo62w-1733047019-1.2.1.1-GeDNigDfIkAwggiN7UqmPrVyxVtKcIm8_uxZhfojCdV8OMToIkY7nniuOytrwt_lP4oHHQV_9hmmaDtEf5EVSrgIsljzku2AUxFz0fflFDdPvPqc5X_xkVve7dm.hmuRzqA2oNhsHm9c9UxzEZ7qxjtFCaWlyH9hycvndp33Pl5xZ3eor0ZWxAMMDo_O3bs2ri1eKIcTXJnYR2QuIw4Hh9Tpkix1hLHU0JZLgi7tpGqGSojX4zk88aT4zx2HzxFpUgmHMaP9TEXaxYVMp0.QfiUoXdQqa0modYRR.zO8cp9C99ZMqH.BRY4XDQ.v7NRp1dX6rDCKYBh4XWM72shldiV5wyl5T4n2UzwBuqL5i02pxDgY312qGnZAWihHQ2wb9jT3GNmTm5cFSd5oZl1TTIElFWVUW._Srjw4CZU.qXy2fBMq0n7nWi3zAPddQvSW', // Add your cookie value
    };

    try {
        const response = await axios.get(url, { headers });

        return response.data
    } catch (error) {
        console.error('Error fetching data:', error.response?.status, error.response?.data || error.message);
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

const getStats = async (req, res) => {
      try {
        let avalanche_stats = await fetchDextoolsData()
        res.status(200).send(avalanche_stats);
    } catch (error) {
        logger.error('Error fetching orders:', error.message);
        res.status(500).send({ error: error.message });
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
    getStats,
    getOrderById
};

