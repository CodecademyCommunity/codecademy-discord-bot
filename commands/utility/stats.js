const Discord = require('discord.js');

module.exports = {
  name: 'stats',
  description: 'Basic server stats',
  guildOnly: true,
  staffOnly: false,
  async execute(msg, args, con) {
    const Embed = new Discord.MessageEmbed();
    Embed.setTitle(`Server Stats`);
    const fetchedMembers = await msg.guild.members.fetch();
    const totalOnline = fetchedMembers
      .filter(
        (member) => member.presence && member.presence.status !== 'offline'
      )
      .size.toString();

    const totalOffline = fetchedMembers
      .filter(
        (member) => !member.presence || member.presence.status == 'offline'
      )
      .size.toString();

    Embed.addField('Online Members', totalOnline);
    Embed.addField('Offline Members', totalOffline);
    Embed.addField('Total Members', msg.guild.memberCount.toString());
    msg.channel.send({embeds: [Embed]});
  },
};
