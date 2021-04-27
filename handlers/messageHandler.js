const {commandParser} = require('./commandParser');
const discordClient = require('../config/client');
const connection = require('../config/connection');

const con = connection.getConnection();
const client = discordClient.getClient();

const messageHandler = async (msg) => {
  if (msg.content.substring(0, 3) === 'cc!') {
    await commandParser(client, con, msg);
  } else if (msg.author.id != client.user.id && msg.guild !== null) {
    client.commands.get('filter').execute(msg);
  }
};

module.exports = {
  messageHandler: messageHandler,
};
