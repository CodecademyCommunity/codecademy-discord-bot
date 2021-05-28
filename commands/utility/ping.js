module.exports = {
  name: 'ping',
  description: 'Ping!',
  guildOnly: true,
  execute(message, args, con) {
    message.channel.send('Pong.');
  },
};
