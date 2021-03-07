const db = require('./db.js');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Asks user whether they want to perform a specific database action.
// If yes, the callback is executed.
function prompt(message, callback, con) {
  return readline.question(message, async (answer) => {
    const lowerAns = answer.toLowerCase();
    if (lowerAns === 'y' || lowerAns === 'yes') {
      const status = await callback();
      readline.close();
      db.disconnect(con, status);
    } else {
      console.log('Exiting. Data will not be lost.');
      readline.close();
      db.disconnect(con);
    }
  });
}

module.exports = {
  prompt: prompt,
};
