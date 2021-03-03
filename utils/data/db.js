require('dotenv').config();
const mysql = require('mysql');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const tables = require('./tables.js');

const con = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
});

async function recreateDB() {
  for (const table of Object.values(tables)) {
    const sql = `
      SET foreign_key_checks = 0;
      DROP TABLE IF EXISTS ${table.name};
      SET foreign_key_checks = 1;
  
      CREATE TABLE ${table.name}(
        ${table.columns.join(', ')}
      );`;

    await query(sql, table);
  }
}

function query(sql, table) {
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

function disconnect(status = null) {
  if (status === 'success') {
    console.log('Database recreated successfully');
  }
  con.end(function (err) {
    err ? console.log(err) : console.log('Connection closed gracefully');
  });
}

readline.question(
  `Are you sure you want to recreate your database? You will lose all your data. y/N  `,
  async (answer) => {
    const lowerAns = answer.toLowerCase();
    if (lowerAns === 'y' || lowerAns === 'yes') {
      await recreateDB();
      readline.close();
      disconnect('success');
    } else {
      console.log('Exiting. Data will not be lost.');
      readline.close();
      disconnect();
    }
  }
);
