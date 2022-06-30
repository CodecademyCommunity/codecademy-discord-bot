require('dotenv').config();
const {getClient} = require('./config/client.js');
const {collectCommands} = require('./collectors/collectCommands');
const {collectEvents} = require('./collectors/collectEvents');
const {unhandledRejectionHandler} = require('./handlers/errorHandlers');
const {
  messageHandler,
  logDeletedMessages,
} = require('./handlers/messageHandlers');

const client = getClient();

// Load commands
const regularCommandsDir = `${__dirname}/commands`;
const slashCommandsDir = `${__dirname}/slash-commands`;
collectCommands({client, regularCommandsDir, slashCommandsDir});

// Load events
const eventsDir = `${__dirname}/events`;
collectEvents({client, eventsDir});

client.on('messageCreate', messageHandler);

client.on('messageDelete', logDeletedMessages);

// Handles unhandled promise rejections which terminate the node process since node v15.
process.on('unhandledRejection', unhandledRejectionHandler);

client.login(process.env.DISCORD_SECRET_KEY);
