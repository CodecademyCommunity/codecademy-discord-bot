const {SlashCommandBuilder} = require('@discordjs/builders');
const {EmbedBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Display basic server stats.'),

  async execute(interaction) {
    const fetchedMembers = await interaction.guild.members.fetch();
    const totalOnline = fetchedMembers.filter(
      (member) =>
        member.presence != null && member.presence.status !== 'offline'
    ).size;
    const totalOffline = fetchedMembers.filter(
      (member) =>
        member.presence == null || member.presence.status === 'offline'
    ).size;

    const serverStatsMessage = new EmbedBuilder()
      .setTitle('Server Stats')
      .addFields([
        {name: 'Online Members', value: `${totalOnline}`},
        {name: 'Offline Members', value: `${totalOffline}`},
        {name: 'Total Members', value: `${interaction.guild.memberCount}`},
      ]);

    interaction.reply({embeds: [serverStatsMessage]});
  },
};
