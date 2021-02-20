const Discord = require('discord.js');
var dateFormat = require('dateformat');

module.exports = {
    name: "unban",
    description: "Unban a user",
    
    execute(msg, args, con) {
        if (!msg.member.roles.cache.some(
            role => role.name === "Admin")) {
                return msg.reply("You must be an Admin to use this command.");
        }else{
            const toUnban = args[0];

            // Sends Audit Log Embed
            let channel = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs')

            const unbanEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${toUnban} was unbanned by ${msg.author.tag}:`)
            .setTimestamp()
            .setFooter(`${msg.guild.name}`);

            channel.send(unbanEmbed);

            msg.guild.members.unban(toUnban)
            msg.reply(`${toUnban} was unbanned.`)
        }
    }
}
