const {getClient} = require('./client.js');
const client = getClient();
const fs = require('fs');

const eventsDir = __dirname + '/../events';

const eventFiles = fs
  .readdirSync(eventsDir)
  .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`${eventsDir}/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}
