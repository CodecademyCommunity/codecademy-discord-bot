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
            } else if (toMute.roles.cache.some(role => role.name === "Muted")) {
                return msg.reply("This user is already muted.");
            } else {
                reason = msg.content.substr(msg.content.indexOf(">") + 2);
                if (reason === "") {
                    return msg.reply("Please provide a reason for muting.");
                }
            }
    
            // Adds Muted role to user.
            toMute.roles.add(msg.guild.roles.cache.find(role => role.name === "Muted"));
            msg.channel.send(`${toMute} was muted by ${msg.member}.\nReason: ${reason}`);

            // Sends user a DM notifying them of their muted status.
            toMute.send("You've been muted for the following reason: ```" + reason + " ```");
        }

        // Outputs a message to the audit-logs channel
        let channel = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs')


        const muteEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${toMute.user.username}#${toMute.user.discriminator} was muted by ${msg.author.tag}:`)
            .setDescription(reason)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${toMute.user.id}/${toMute.user.avatar}.png`)
            .setTimestamp()
            .setFooter(`${msg.guild.name}`);

        channel.send(muteEmbed);

        // Add record to infractions table.
        let now = new Date();
        let timestamp = dateFormat(now, "yyyy-mm-dd HH:MM:ss");

        var sqlInfractions = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) 
        VALUES ('${timestamp}', '${toMute}', 'cc!mute', 'N/A', '${reason}', true, '${msg.author.tag}')`;

        con.query(sqlInfractions, function (err, result) {
            if (err) {
            console.log(err);
            } else {
            console.log("1 record inserted into infractions.");
            }
        });

        var sqlModLog = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) 
        VALUES ('${timestamp}', '${msg.author.tag}', '${msg}', 'N/A', '${reason}')`;

        con.query(sqlModLog, function (err, result) {
            if (err) {
            console.log(err);
            } else {
            console.log("1 record inserted into mod_log.");
            }
        });
    },
};
