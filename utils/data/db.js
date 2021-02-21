require('dotenv').config();
const mysql = require('mysql');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const con = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
  });

const sql = `
  SET foreign_key_checks = 0;
  DROP TABLE IF EXISTS verifications, infractions, mod_log;
  SET foreign_key_checks = 1;

  CREATE TABLE verifications(
    id INT AUTO_INCREMENT PRIMARY Key,
    username varchar(255),
    verify_id varchar(255) NOT NULL,
    expiration DATETIME
  );
  
  CREATE TABLE infractions(
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME,
    user varchar(255) NOT NULL,
    action varchar(255),
    length_of_time varchar(255),
    reason varchar(255),
    invalid boolean,
    moderator varchar(255)
  );
  
  CREATE TABLE mod_log(
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME,
    moderator varchar(255) NOT NULL,
    action varchar(255),
    length_of_time varchar(255),
    reason varchar(255)
  );`;

function recreateDB() {
  con.query(sql, function(err) {
    err ? console.log(err) : console.log('Database recreated successfully');
  });
  
  con.end(function(err) {
    err ? console.log(err) : console.log('Connection closed gracefully');
  });
}

readline.question(
  `Are you sure you want to recreate your database? You will lose all your data. y/N  `,
  answer => {
    const lowerAns = answer.toLowerCase();
    if (lowerAns === 'y' || lowerAns === 'yes') {
      recreateDB();
      readline.close();
    } else {
      console.log('Exiting. Data will not be lost.');
      readline.close();
    }
  }
);
