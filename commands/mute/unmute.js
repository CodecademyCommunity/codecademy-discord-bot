const Discord = require('discord.js');
var dateFormat = require('dateformat');

module.exports = {
    name: 'unmute',
    description: 'Unmute a user',

    execute(msg, con) {
        var toUnmuteDisplay = undefined;

        if (!msg.member.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin" || role.name === "Super User")) {
            return msg.reply("You must be a super user, moderator, or admin to use this command.");
        } 

        const toUnmute = msg.mentions.members.first();
        if (!toUnmute) {
            return msg.reply("Please provide a user to unmute.");
        } else {
            toUnmuteDisplay = toUnmute.displayName;
        }

        // Invalid is only used to specifiy whether the infraction has been "removed" or not.

        // Removes Muted role from user.
        toUnmute.roles.remove(msg.guild.roles.cache.find(role => role.name === "Muted"));
        msg.channel.send(`${toUnmute} was unmuted.`);

        // Outputs a message to the audit-logs channel
        let channel = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs')
        
        const unMuteEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${toUnmute.user.username}#${toUnmute.user.discriminator} was unmuted by ${msg.author.tag}:`)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${toUnmute.user.id}/${toUnmute.user.avatar}.png`)
            .setTimestamp()
            .setFooter(`${msg.guild.name}`);

        channel.send(unmuteEmbed);

        // Add record to infractions table.
        let now = new Date();
        let timestamp = dateFormat(now, "yyyy-mm-dd HH:MM:ss");

        var sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, invalid, moderator) 
        VALUES ('${timestamp}', '${toUnmute}', 'cc!unmute', 'N/A', 'N/A', true, '${msg.member.tag}')`;

        con.query(sql, function (err, result) {
            if (err) {
            console.log(err);
            } else {
            console.log("1 record inserted.");
            }
        });

    },
};
