const db = require('./db.js');
const tables = require('./tables.js');
const {prompt} = require('./prompt.js');

const con = db.connect();

const rawArgs = process.argv.slice(2);
const data = parseArgs(rawArgs);

const msg = `Are you sure you want to add column "${data.column} ${data.type}" to "${data.table}"? y/N  `;

// Parses arguments from command line and
// returns an object with appropriate key-value pairs
function parseArgs(raw) {
  const [table, col, type] = raw.map((arg) => {
    return arg.split('=')[1];
  });

  return {
    table: table,
    column: col,
    type: type,
  };
}

// Creates one or more tables from `tables.js` if they don't exist.
// Returns 'success' or a SQL error string.
async function addColumn() {
  const table = tables[`${data.table}`];
  const sql = `
      ALTER TABLE ${data.table}
      ADD COLUMN ${data.column} ${data.type}`;

  try {
    await db.query(con, sql, table);
  } catch (error) {
    return error.sqlMessage;
  }
  return 'success';
}

prompt(msg, addColumn, con);
