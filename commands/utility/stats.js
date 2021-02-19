module.exports = {
	name: 'stats',
	description: 'Basic server stats',
	execute(msg,Discord) {
        const Embed = new Discord.MessageEmbed();
        Embed.setTitle(`Server Stats`)
        // Using Collection.filter() to separate the online members from the offline members.
        Embed.addField("Online Members", msg.guild.members.cache.filter(member => member.presence.status !== "offline").size);
        Embed.addField("Offline Members", msg.guild.members.cache.filter(member => member.presence.status == "offline").size);
        Embed.addField("Total Members", msg.guild.memberCount);
        msg.channel.send(Embed);
	},
};
