const {getClient} = require('../config/client.js');
const client = getClient();
const {EmbedBuilder} = require('discord.js');

async function unhandledRejectionHandler(error) {
  try {
    console.error('Unhandled promise rejection:', error);
    const channel = client.channels.cache.get(process.env.BOT_ERROR_CHANNEL_ID);
    if (channel) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('UnhandledRejection error')
        .setColor('RED')
        .addFields(
          {name: 'Name', value: error.name},
          {name: 'Message', value: error.message},
          {
            name: 'Info',
            value: `Path: ${error.path}\nMethod: ${error.method}\nHTTP Status: ${error.httpStatus}`,
          }
        )
        .setTimestamp();
      await channel.send({embeds: [errorEmbed]});
    }
  } catch (rejectionHandlerErr) {
    console.error('Error in unhandledRejection handler:', rejectionHandlerErr);
  }
}

module.exports = {unhandledRejectionHandler};
