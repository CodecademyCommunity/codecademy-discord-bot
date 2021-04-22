module.exports = {
  name: 'ping',
  description: 'Ping!',
  execute(message, args, con) {
    message.channel.send('Pong.');
  },
};
