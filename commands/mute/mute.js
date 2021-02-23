const Discord = require('discord.js');
var dateFormat = require('dateformat');

module.exports = {
    name: 'mute',
    description: 'Mute a user',

    execute(msg, con) {
        let toMute = undefined;
        let reason = undefined;

        // Checks if user can perform command and validates message content.
        if (!message.member.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin")) {
            return message.reply("You must be a moderator or admin to use this command.");
        }
        toMute = message.mentions.members.first();
        if (!toMute) {
            return message.reply("Please provide a user to mute.");
        } else if (toMute === msg.member) {
            return message.reply("You cannot mute yourself.");
        } else if (toMute.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin")) {
            return message.reply("You cannot mute a moderator or admin.");
        } else if (toMute.roles.cache.some(role => role.name === "Muted")) {
            return message.reply("This user is already muted.");
        } else {
            reason = message.content.substr(message.content.indexOf(">") + 2);
            if (reason === "") {
                return message.reply("Please provide a reason for muting.");
            }
        }

        muteUser(msg);
        auditLog(msg);
        recordInDB(msg);

        function muteUser(message) {
            // Adds Muted role to user.
            toMute.roles.add(message.guild.roles.cache.find(role => role.name === "Muted"));
            message.channel.send(`${toMute} was muted by ${message.member}.\nReason: ${reason}`);

            // Sends user a DM notifying them of their muted status.
            toMute.send("You've been muted for the following reason: ```" + reason + " ```");
        }

        function auditLog(message) {
            // Outputs a message to the audit-logs channel.
            let channel = message.guild.channels.cache.find(channel => channel.name === 'audit-logs')

            const muteEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${toMute.user.username}#${toMute.user.discriminator} was muted by ${message.author.tag}:`)
                .setDescription(reason)
                .setThumbnail(`https://cdn.discordapp.com/avatars/${toMute.user.id}/${toMute.user.avatar}.png`)
                .setTimestamp()
                .setFooter(`${message.guild.name}`);

            channel.send(muteEmbed);
        }

        function recordInDB(message) {
            let now = new Date();
            let timestamp = dateFormat(now, "yyyy-mm-dd HH:MM:ss");

            var sqlInfractions = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) 
            VALUES ('${timestamp}', '${toMute}', 'cc!mute', NULL, '${reason}', true, '${message.author.tag}')`;

            var sqlModLog = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) 
            VALUES ('${timestamp}', '${message.author.tag}', '${message}', NULL, '${reason}')`;

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
