const Discord = require('discord.js');
var dateFormat = require('dateformat');
const ms = require('ms');

module.exports = {
    name: 'tempmute',
    description: 'Temporarily mute a user',

    execute(msg, args, con) {
        let toTempMute = undefined;
        let reason = undefined;
        let lengthOfTime = undefined;
        
        // Checks if user can perform command and validates message content.
        if (!msg.member.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin")) {
            return msg.reply("You must be a moderator or admin to use this command.");
        }
        const command_regex = /(\<@!?\d+\>)\s(\d+[yhwdms])\s(.+)$/;

        if (!args.join(" ").match(command_regex)) {
            return msg.reply("The command you sent isn't in a valid format.")
        }
        [, id, lengthOfTime, reason] = args.join(" ").match(command_regex) ?? []

        toTempMute = msg.mentions.members.first();
        if (!toTempMute) {
            return msg.reply("Please provide a user to temporarily mute.");
        } else if (toTempMute === msg.member) {
            return msg.reply("You cannot temporarily mute yourself.");
        } else if (toTempMute.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin")) {
            return msg.reply("You cannot temporarily mute a moderator or admin.");
        } else if (toTempMute.roles.cache.some(role => role.name === "Muted")) {
            return msg.reply("This user is already muted.");
        } else {
            if (reason === "") {
                return msg.reply("Please provide a reason for muting.");
            }
        }

        // Mutes user.
        muteUser(msg);
        auditLogMute(msg);
        recordMuteInDB(msg, con);
        // Unmutes user after specified time period.
        setTimeout(() => {
            unmuteUser(msg);
            auditLogUnmute(msg);
            recordUnmuteInDB(con);  
        }, ms(lengthOfTime));
    
        function muteUser(message) {
            // Adds Muted role to user.
            toTempMute.roles.add(message.guild.roles.cache.find(role => role.name === "Muted"));
            message.channel.send(`${toTempMute} was muted by ${message.member}.\nReason: ${reason}`);

            // Sends user a DM notifying them of their muted status.
            toTempMute.send("You've been muted for " + lengthOfTime + " for the following reason: ```" + reason + " ```");
        }

        function unmuteUser(message) {
            toUnmute = message.mentions.members.first();
            toUnmute.roles.remove(message.guild.roles.cache.find(role => role.name === "Muted"));
            message.channel.send(`${toUnmute} was unmuted.`);
            toUnmute.send("You've been unmuted.");
        }

        function auditLogMute(message) {
            // Outputs a message to the audit-logs channel.
            let channel = message.guild.channels.cache.find(channel => channel.name === 'audit-logs')

            const tempmuteEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${toTempMute.user.username}#${toTempMute.user.discriminator} was muted by ${message.author.tag}:`)
                .setDescription(reason)
                .setThumbnail(`https://cdn.discordapp.com/avatars/${toTempMute.user.id}/${toTempMute.user.avatar}.png`)
                .setTimestamp()
                .setFooter(`${message.guild.name}`);

            channel.send(tempmuteEmbed);
        }

        function auditLogUnmute(message) {
            let channel = message.guild.channels.cache.find(channel => channel.name === 'audit-logs')

            const tempUnmuteEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${toTempMute.user.username}#${toTempMute.user.discriminator} was unmuted after ${lengthOfTime}:`)
                .setThumbnail(`https://cdn.discordapp.com/avatars/${toTempMute.user.id}/${toTempMute.user.avatar}.png`)
                .setTimestamp()
                .setFooter(`${message.guild.name}`);

            channel.send(tempUnmuteEmbed)
        }

        function recordMuteInDB(message, connection) {
            let now = new Date();
            let timestamp = dateFormat(now, "yyyy-mm-dd HH:MM:ss");

            var sqlInfractions = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) 
            VALUES ('${timestamp}', '${toTempMute}', 'cc!tempmute', '${lengthOfTime}', '${reason}', true, '${message.author.tag}')`;

            var sqlModLog = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) 
            VALUES ('${timestamp}', '${message.author.tag}', '${message}', '${lengthOfTime}', '${reason}')`;

            connection.query(`${sqlInfractions}; ${sqlModLog}`, function (err, result) {
                if (err) {
                console.log(err);
                } else {
                console.log("1 record inserted into infractions, 1 record inserted into mod_log.");
                }
            });
        }

        function recordUnmuteInDB(connection) {
            let now = new Date()
            let timestamp = dateFormat(now, "yyyy-mm-dd HH:MM:ss")

            var sqlInfractions2 = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) 
            VALUES ('${timestamp}', '${toTempMute}', 'cc!unmute', NULL, 'tempmute expired', true, 'automatic')`;

            var sqlModLog2 = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) 
            VALUES ('${timestamp}', 'automatic', 'cc!unmute', NULL, 'tempmute expired')`;

            connection.query(`${sqlInfractions2}; ${sqlModLog2}`, function (err, result) {
                if (err) {
                console.log(err);
                } else {
                console.log("1 record inserted into infractions, 1 record inserted into mod_log.");
                }
            });
        }
    },
};
