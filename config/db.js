const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
});

const destroyConnection = async () => {
  await connection.destroy();
};

module.exports = {
  getConnection: () => connection,
  destroyConnection: destroyConnection,
};
