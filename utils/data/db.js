require('dotenv').config();
const mysql = require('mysql');

function connect() {
  return mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });
}

// Converts MySQL query into a promise and
// executes query on given table
function query(con, sql, table) {
  return new Promise((resolve, reject) => {
    con.query(sql, (err, results, fields) => {
      if (err) {
        reject(err);
      } else {
        console.log(`${table.name}..........OK`);
        resolve(results, fields);
      }
    });
  });
}

function disconnect(con, status = null) {
  if (status === 'success') {
    console.log('Database updated successfully');
  } else {
    status ? console.log(status) : console.log('...');
  }
  con.end(function (err) {
    err ? console.log(err) : console.log('Connection closed gracefully');
  });
}

module.exports = {
  connect: connect,
  query: query,
  disconnect: disconnect,
};
