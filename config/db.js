const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
});

// Promise wrapped instance of the pool
const promisePool = pool.promise();

module.exports = {
  promisePool,
  getConnection: () => pool,
};
