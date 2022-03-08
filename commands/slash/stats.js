const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slash-stats')
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

    const Embed = new MessageEmbed();
    Embed.setTitle('Server Stats');
    Embed.addField('Online Members', `${totalOnline}`);
    Embed.addField('Offline Members', `${totalOffline}`);
    Embed.addField('Total Members', `${interaction.guild.memberCount}`);

    interaction.reply({embeds: [Embed]});
  },
};
