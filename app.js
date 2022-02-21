const {getClient} = require('./config/client.js');
const {collectCommands} = require('./config/collectors');
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

client.on('messageCreate', messageHandler);

client.on('messageDelete', logDeletedMessages);

process.on('unhandledRejection', async (error) => {
  try {
    console.error('Unhandled promise rejection:', error);
    const channel = client.channels.cache.find(
      (channel) => channel.name === 'audit-logs'
    );
    if (channel) {
      await channel.send(
        `UnhandledRejection error. Check logs for more info. Type: ${error.name} Message: ${error.message}`
      );
    }
  } catch (rejectionHandlerErr) {
    console.error('Error in unhandledRejection handler:', rejectionHandlerErr);
  }
});

client.login(process.env.DISCORD_SECRET_KEY);
