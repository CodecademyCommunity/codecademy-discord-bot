const db = require('./db.js');
const tables = require('./tables.js');
const {prompt} = require('./prompt.js');

const con = db.connect();

const tableNames = process.argv.slice(2);
const tableNamesStr = tableNames.join(', ');
const tablesToDrop = Object.values(tables).filter((table) =>
  tableNames.includes(table.name)
);

const msg = `Are you sure you want to drop table(s) "${tableNamesStr}" from your database? y/N  `;

// Drops one or more tables defined in `tables.js` if they exist.
// Returns 'success' or a SQL error string.
async function addTable() {
  if (!tablesToDrop.length) {
    return 'You did not name an existing table. No changes were made.';
  }

  for (const table of tablesToDrop) {
    const sql = `
        SET foreign_key_checks = 0;
        DROP TABLE ${table.name};
        SET foreign_key_checks = 1;`;
    try {
      await db.query(con, sql, table);
    } catch (error) {
      return error.sqlMessage;
    }
  }
  return 'success';
}

prompt(msg, addTable, con);
