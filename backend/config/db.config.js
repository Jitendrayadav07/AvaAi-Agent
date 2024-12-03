// config/db.config.js
const { Sequelize } = require("sequelize");
require("dotenv").config();


//Localhost Databse Connection
const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.USER_NAME,
    process.env.PASSWORD,
    {
        host: process.env.HOST,
        dialect: "mysql",
        port: process.env.PORT,
        dialectOptions: {
            connectTimeout: 20000 // Connection timeout in milliseconds (20 seconds)
        },
        pool: {
            max: 10, // Maximum number of connections in the pool
            min: 0, // Minimum number of connections in the pool
            acquire: 30000, // Maximum time in milliseconds that a connection can be acquired
            idle: 10000 // Maximum time in milliseconds that a connection can be idle before being released
        }
    }
);


// Test the database connection
sequelize
    .authenticate()
    .then(() => {
        console.log("Database connection has been established successfully.");
    })
    .catch((err) => {
        console.error("Unable to connect to the database:", err);
});


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


//All Model File Import 
db.tbl_uprising_users = require("../models/tbl_uprising_users")(sequelize,Sequelize);
db.tbl_arena_transactions = require("../models/tbl_arena_transactions")(sequelize,Sequelize);
db.tbl_orders_data = require("../models/tbl_orders_data")(sequelize,Sequelize);


module.exports = db;