const db = require('./db.js');
const tables = require('./tables.js');
const {prompt} = require('./prompt.js');

const con = db.connect();
const msg = `Are you sure you want to recreate your database? You will lose all your data. y/N  `;

// Fully drops and re-creates the database using the tables from `tables.js`
async function recreateDB() {
  for (const table of Object.values(tables)) {
    const sql = `
        SET foreign_key_checks = 0;
        DROP TABLE IF EXISTS ${table.name};
        SET foreign_key_checks = 1;
    
        CREATE TABLE ${table.name}(
          ${table.columns.join(', ')}
        );`;

    await db.query(con, sql, table);
  }
}

prompt(msg, recreateDB, con);
