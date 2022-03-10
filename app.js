const {getClient} = require('./config/client.js');
const {collectCommands} = require('./config/collectors');
const {extendMutes} = require('./handlers/channelHandlers.js');
const {
  applyMuteRestrictionsToOnMuteRole,
  createOnMuteRole,
} = require('./handlers/guildHandlers.js');
const {unhandledRejectionHandler} = require('./handlers/errorHandlers');
const {
  messageHandler,
  logDeletedMessages,
} = require('./handlers/messageHandlers');
const fs = require('fs');

require('dotenv').config();

const client = getClient();

const commandsDir = `${__dirname}/commands`;

collectCommands(client, commandsDir);

// Load events
const eventsDir = `${__dirname}/events`;

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

// Adds a Muted role when the bot joins a server
client.on('guildCreate', createOnMuteRole);

// Denies reacting and message sending permissions for users with Muted role.
client.on('roleCreate', applyMuteRestrictionsToOnMuteRole);

// Upon channel creation, mutes all users with Muted role in the new channel.
client.on('channelCreate', extendMutes);

client.on('messageCreate', messageHandler);

client.on('messageDelete', logDeletedMessages);

// Handles unhandled promise rejections which terminate the node process since node v15.
process.on('unhandledRejection', unhandledRejectionHandler);

client.login(process.env.DISCORD_SECRET_KEY);
