const Discord = require('discord.js');
var dateFormat = require('dateformat');

module.exports = {
    name: 'unmute',
    description: 'Unmute a user',

    execute(msg, con) {
        // Checks if user can perform command and validates message content.
        if (!msg.member.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin" || role.name === "Super User")) {
            return msg.reply("You must be a super user, moderator, or admin to use this command.");
        } 
        toUnmute = msg.mentions.members.first();
        if (!toUnmute) {
            return msg.reply("Please provide a user to unmute.");
        } else if (!toUnmute.roles.cache.some(role => role.name === "Muted")) {
            return msg.reply("This user is already unmuted.");
        }

        unmuteUser(msg);
        auditLog(msg);
        recordInDB(msg);

        function unmuteUser(message) {
            // Removes Muted role from user.
            toUnmute.roles.remove(message.guild.roles.cache.find(role => role.name === "Muted"));
            message.channel.send(`${toUnmute} was unmuted.`);

            // Sends user a DM notifying them of their unmuted status.
            toUnmute.send("You've been unmuted.");
        }

        function auditLog(message) {
            // Outputs a message to the audit-logs channel.
            let channel = message.guild.channels.cache.find(channel => channel.name === 'audit-logs')
            
            const unMuteEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${toUnmute.user.username}#${toUnmute.user.discriminator} was unmuted by ${message.author.tag}:`)
                .setThumbnail(`https://cdn.discordapp.com/avatars/${toUnmute.user.id}/${toUnmute.user.avatar}.png`)
                .setTimestamp()
                .setFooter(`${message.guild.name}`);

            channel.send(unMuteEmbed);
        }

        function recordInDB(message) {
            let now = new Date();
            let timestamp = dateFormat(now, "yyyy-mm-dd HH:MM:ss");

            var sqlInfractions = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) 
            VALUES ('${timestamp}', '${toUnmute}', 'cc!unmute', NULL, NULL, true, '${message.author.tag}')`;

            var sqlModLog = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason)
            VALUES ('${timestamp}', '${message.author.tag}', '${message}', NULL, NULL)`;

            con.query(`${sqlInfractions}; ${sqlModLog}`, function (err, result) {
                if (err) {
                console.log(err);
                } else {
                console.log("1 record inserted into infractions, 1 record inserted into mod_log.");
                }
            });
        }
    },
};
