const axios = require('axios');
const DataSource = require('loopback-datasource-juggler').DataSource;
let bluebird = require('bluebird');
const fs = require('fs');
require('dotenv').config();
const path = require('path');
const cron = require('node-cron');

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
    // console.log('Executing MySQL query:', { query, values });
    return new bluebird.Promise(function (resolve, reject) {
        dataSource.connector.query(query, values, function (err, results) {
            if (err) {
                console.error('Database Error:', err);
                return resolve(false);
            }
            // console.log('Query results:', results?.length || 0, 'rows');
            resolve(results);
        });
    });
};

async function user_tweets(user_id) {
    console.log('Fetching tweets for user:', user_id);

    const API_URL = `https://api.starsarena.com/threads/feed/user?userId=${user_id}&page=1&pageSize=40`;

    const response = await axios.get(API_URL, {
        headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`
        }
    });

    let thread_data = response.data.threads;
    // console.log('Retrieved threads:', thread_data?.length || 0);

    for(let j = 0; j < thread_data.length; j++) {
        if(thread_data[j].threadType === 'text') {
            // console.log('Found text thread:', thread_data[j].id);

            let data_obj = {
                user_id: thread_data[j].id,
                tweet: thread_data[j].content,
                tweet_time: thread_data[j].createdDate,
                answerCount: thread_data[j].answerCount,
            }
            // console.log('Processed tweet data:', data_obj);
            return data_obj;
        }
    }
}

async function get_user_details() {
    try {
        console.log('Starting user details fetch');
        let user_data = await getmysqlquery(`SELECT * FROM tbl_uprising_users`);

        let combine_array = [];
        for(let i = 0; i < user_data.length; i++) {
            let user_tweet_data = await user_tweets(user_data[i].user_uuid);
            if (user_tweet_data) {
                combine_array.push(user_tweet_data);
            }
        }

        // console.log('Final processed data:', combine_array);
        
        const jsonData = JSON.stringify(combine_array, null, 2);
        fs.writeFileSync('/home/ubuntu/bounty-agent/arena_analyst/src/arena_analyst/crews/poem_crew/files/data.json', jsonData);
        console.log('Data saved to data.json');
        
        return combine_array;
        
    } catch (error) {
        console.error('Error in get_user_details:', error);
        throw error;
    }
}

cron.schedule('0 * * * *', async () => {
    console.log('Cron job running at:', new Date());
    await get_user_details();
});