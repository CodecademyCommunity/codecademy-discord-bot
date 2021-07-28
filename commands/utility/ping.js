module.exports = {
  name: 'ping',
  description: 'Ping!',
  guildOnly: true,
  staffOnly: false,
  execute(message, args, con) {
    message.channel.send('Pong.');
  },
};
