const fs = require('fs');

function collectEvents({client, eventsDir}) {
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
}

module.exports = {collectEvents};
