const Discord = require('discord.js');

const client = new Discord.Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

module.exports = {
  getClient: () => client,
};
