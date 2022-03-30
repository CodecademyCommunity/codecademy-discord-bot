const {getClient} = require('./config/client.js');
const {collectCommands} = require('./collectors/collectCommands');
const {collectEvents} = require('./collectors/collectEvents');
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

require('dotenv').config();

const client = getClient();

// Load commands
const regularCommandsDir = `${__dirname}/commands`;
const slashCommandsDir = `${__dirname}/slash-commands`;
collectCommands({client, regularCommandsDir, slashCommandsDir});

// Load events
const eventsDir = `${__dirname}/events`;
collectEvents({client, eventsDir});

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
