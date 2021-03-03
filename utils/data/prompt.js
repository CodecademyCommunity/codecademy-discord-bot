const db = require('./db.js');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompts the user with a message - if yes, the callback is executed
function prompt(message, callback, con) {
  return readline.question(message, async (answer) => {
    const lowerAns = answer.toLowerCase();
    if (lowerAns === 'y' || lowerAns === 'yes') {
      await callback();
      readline.close();
      db.disconnect(con, 'success');
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
