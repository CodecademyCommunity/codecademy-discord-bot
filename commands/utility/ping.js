module.exports = {
  name: 'ping',
  description: 'Ping!',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Code Counselor',
  async execute(message, args, con) {
    const response = await message.channel.send('Pinging!');
    response.edit(
      `Pong! I took ${
        response.createdTimestamp - message.createdTimestamp
      }ms to respond 🏓`
    );
  },
};
