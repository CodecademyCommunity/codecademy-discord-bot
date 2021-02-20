const Discord = require('discord.js');
var dateFormat = require('dateformat');

module.exports = {
    name: 'mute',
    description: 'Mute a user',

    execute(msg, con) {
        let toMute = undefined;
        let reason = undefined;

        if (!msg.member.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin")) {
            return msg.reply("You must be a moderator or admin to use this command.");
        } else {
            toMute = msg.mentions.members.first();
            if (!toMute) {
                return msg.reply("Please provide a user to mute.");
            } else if (toMute === msg.member) {
                return msg.reply("You cannot mute yourself.");
            } else if (toMute.roles.cache.some(
            role => role.name === "Moderator" || role.name === "Admin")) {
                return msg.reply("You cannot mute a moderator or admin.");
            } else {
                reason = msg.content.substr(msg.content.indexOf(">") + 2);
                if (reason === "") {
                    return msg.reply("Please provide a reason for muting.");
                }
            }
    
            // Adds Muted role to user.
            toMute.roles.add(msg.guild.roles.cache.find(role => role.name === "Muted"));
            msg.channel.send(`${toMute} was muted by ${msg.member}.\nReason: ${reason}`);
        }

        // Outputs a message to the audit-logs channel
        let channel = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs')


        const muteEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${toMute.user.username}#${toMute.user.discriminator} was unmuted by ${msg.author.tag}:`)
            .setDescription(reason)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${toMute.user.id}/${toMute.user.avatar}.png`)
            .setTimestamp()
            .setFooter(`${msg.guild.name}`);

        channel.send(muteEmbed);

        // Add record to infractions table.
        const timestamp = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
        var sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, invalid, moderator) 
        VALUES ('${timestamp}', '${toMute}', 'cc!mute', 'N/A', '${reason}', true, '${msg.member.displayName}')`;

        con.query(sql, function (err, result) {
            if (err) {
            console.log(err);
            } else {
            console.log("1 record inserted.");
            }
        });
    },
};
