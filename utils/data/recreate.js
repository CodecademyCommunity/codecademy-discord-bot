const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const db = require('./db.js');
const tables = require('./tables.js');

const con = db.connect();

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

readline.question(
  `Are you sure you want to recreate your database? You will lose all your data. y/N  `,
  async (answer) => {
    const lowerAns = answer.toLowerCase();
    if (lowerAns === 'y' || lowerAns === 'yes') {
      await recreateDB();
      readline.close();
      db.disconnect(con, 'success');
    } else {
      console.log('Exiting. Data will not be lost.');
      readline.close();
      db.disconnect(con);
    }
  }
);
