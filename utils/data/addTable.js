const db = require('./db.js');
const tables = require('./tables.js');
const {prompt} = require('./prompt.js');

const con = db.connect();

const tableNames = process.argv.slice(2);
const tableNamesStr = tableNames.join(', ');
const tablesToAdd = Object.values(tables).filter((table) =>
  tableNames.includes(table.name)
);

const msg = `Are you sure you want to add table(s) "${tableNamesStr}" to your database? y/N  `;

// Creates one or more tables from `tables.js` if they don't exist.
// Returns 'success' or a SQL error string.
async function addTable() {
  for (const table of tablesToAdd) {
    const sql = `
        CREATE TABLE ${table.name}(
          ${table.columns.join(', ')}
        );`;
    try {
      await db.query(con, sql, table);
    } catch (error) {
      return error.sqlMessage;
    }
  }
  return 'success';
}

prompt(msg, addTable, con);
