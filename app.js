const {getClient} = require('./config/client.js');
const {collectCommands} = require('./config/commands');
const {extendMutes} = require('./handlers/channelHandlers.js');
const {applyMute, createMutedRole} = require('./handlers/guildHandlers.js');
const {
  messageHandler,
  logDeletedMessages,
} = require('./handlers/messageHandlers');

require('dotenv').config();

const client = getClient();
const commandsDir = `${__dirname}/commands`;

collectCommands(client, commandsDir);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Adds a Muted role when the bot joins a server
client.on('guildCreate', createMutedRole);

// Denies reacting and message sending permissions for users with Muted role.
client.on('guildMemberUpdate', applyMute);

// Upon channel creation, mutes all users with Muted role in the new channel.
client.on('channelCreate', extendMutes);

client.on('message', messageHandler);

client.on('messageDelete', logDeletedMessages);

client.login(process.env.DISCORD_SECRET_KEY);
