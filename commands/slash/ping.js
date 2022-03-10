const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slash-ping')
    .setDefaultPermission(false)
    .setDescription('Replies with Pong!'),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: 'Pong! :ping_pong:',
      fetchReply: true,
    });
    interaction.editReply(
      `Pong! :ping_pong: Roundtrip latency: ${
        sent.createdTimestamp - interaction.createdTimestamp
      }ms`
    );
  },
};
