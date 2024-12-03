const axios = require('axios');
const DataSource = require('loopback-datasource-juggler').DataSource;
let bluebird = require('bluebird');
require('dotenv').config();


// Define the API URL and Bearer token
const API_URL = 'https://api.starsarena.com/uprising/user-leaderboard?page=1&pageSize=500';
const BEARER_TOKEN = process.env.BEARER_TOKEN;

const dataSource = new DataSource({
    connector: require('loopback-connector-mysql'),
    host: process.env.HOST,
    port: process.env.PORT,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    user: process.env.USER_NAME,
    charset: 'utf8mb4',  // Ensures utf8mb4 is used
    collation: 'utf8mb4_unicode_ci'
});

let getmysqlquery = async function (query, values) {
    return new bluebird.Promise(function (resolve, reject) {
        dataSource.connector.query(query, values, function (err, results) {
            if (err) {
                console.error('Database Error:', err);
                return resolve(false);
            }
            resolve(results);
        });
    });
};

async function uprising_users() {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`
            }
        });

        console.log(response.data);

        let data = response.data.results;
        let false_ranks = [];

        for (let i = 0; i < data.length; i++) {
            // Prepare the insert query and use placeholders to prevent SQL injection and character issues
            let query = `INSERT INTO tbl_uprising_users (user_uuid, user_rank, twitter_handle, user_name, user_picture, points) VALUES (?, ?, ?, ?, ?, ?)`;

            let values = [
                data[i].id,
                data[i].position,
                data[i].twitterHandle,
                data[i].userName,
                data[i].userPicture,
                data[i].points
            ];

            let user_details = await getmysqlquery(query, values);

            if (user_details === false) {
                console.log("Insertion failed for rank:", data[i].position);
                false_ranks.push(data[i].position);
            }
        }

        console.log({ false_ranks });
    } catch (error) {
        console.error("Error in API call or processing:", error);
    }
}

uprising_users()