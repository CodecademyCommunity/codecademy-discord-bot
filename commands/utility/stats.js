module.exports = {
  name: "stats",
  description: "Basic server stats",
  async execute(msg, Discord) {
    const Embed = new Discord.MessageEmbed();
    Embed.setTitle(`Server Stats`);
    const fetchedMembers = await msg.guild.members.fetch();
    const totalOnline = fetchedMembers.filter(
      (member) => member.presence.status !== "offline"
    ).size;
    const totalOffline = fetchedMembers.filter(
      (member) => member.presence.status == "offline"
    ).size;
    Embed.addField("Online Members", totalOnline);
    Embed.addField("Offline Members", totalOffline);
    Embed.addField("Total Members", msg.guild.memberCount);
    msg.channel.send(Embed);
  },
};
