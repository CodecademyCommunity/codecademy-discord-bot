const {getClient} = require('../config/client.js');
const client = getClient();

async function unhandledRejectionHandler(error) {
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
}

module.exports = {unhandledRejectionHandler};
