const Discord = require('discord.js');
var dateFormat = require('dateformat');
const ms = require('ms');

module.exports = {
    name: 'tempmute',
    description: 'Temporarily mute a user',

    execute(msg, args, con) {
        let reason = undefined;
        let lengthOfTime = undefined;

        if (!msg.member.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin")) {
            return msg.reply("You must be a moderator or admin to use this command.");
        } else {
            if (!args.join(" ").match(/(\<@!?\d+\>)\s(\d+[yhwdms])\s(.+)$/)) {
                return msg.reply("The command you sent isn't in a valid format.")
            }

            [, id, lengthOfTime, reason] = args.join(" ").match(/(\<@!?\d+\>)\s(\d+[yhwdms])\s(.+)$/) ?? []

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
    
            // Adds Muted role to user.
            toTempMute.roles.add(msg.guild.roles.cache.find(role => role.name === "Muted"));
            msg.channel.send(`${toTempMute} was muted by ${msg.member}.\nReason: ${reason}`);

            // Sends user a DM notifying them of their muted status.
            toTempMute.send("You've been muted for " + lengthOfTime + " for the following reason: ```" + reason + " ```");
        }

        // Outputs a message to the audit-logs channel
        let channel = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs')

        const tempmuteEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${toTempMute.user.username}#${toTempMute.user.discriminator} was muted by ${msg.author.tag}:`)
            .setDescription(reason)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${toTempMute.user.id}/${toTempMute.user.avatar}.png`)
            .setTimestamp()
            .setFooter(`${msg.guild.name}`);

            channel.send(tempmuteEmbed);

        const tempUnMuteEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${toTempMute.user.username}#${toTempMute.user.discriminator} was unmuted after ${lengthOfTime}:`)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${toTempMute.user.id}/${toTempMute.user.avatar}.png`)
            .setTimestamp()
            .setFooter(`${msg.guild.name}`);

        // Add record to infractions table.
        let now = new Date();
        let timestamp = dateFormat(now, "yyyy-mm-dd HH:MM:ss");

        var sqlInfractions = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) 
        VALUES ('${timestamp}', '${toTempMute}', 'cc!tempmute', '${lengthOfTime}', '${reason}', true, '${msg.author.tag}')`;

        con.query(sqlInfractions, function (err, result) {
            if (err) {
            console.log(err);
            } else {
            console.log("1 record inserted into infractions.");
            }
        });

        var sqlModLog = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) 
        VALUES ('${timestamp}', '${msg.author.tag}', '${msg}', '${lengthOfTime}', '${reason}')`;

        con.query(sqlModLog, function (err, result) {
            if (err) {
            console.log(err);
            } else {
            console.log("1 record inserted into mod_log.");
            }
        });

        const unmute = (message) => {
            toUnmute = message.mentions.members.first();
            toUnmute.roles.remove(message.guild.roles.cache.find(role => role.name === "Muted"));
            message.channel.send(`${toUnmute} was unmuted.`);
            toUnmute.send("You've been unmuted.");
        }

        timestamp = dateFormat(now, "yyyy-mm-dd HH:MM:ss");

        var sqlInfractions2 = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) 
        VALUES ('${timestamp}', '${toTempMute}', 'cc!unmute', 'N/A', 'tempmute expired', true, 'automatic')`;

        var sqlModLog2 = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) 
        VALUES ('${timestamp}', 'automatic', 'cc!unmute', 'N/A', 'tempmute expired')`;

        setTimeout(() => {
            unmute(msg)
            channel.send(tempUnMuteEmbed)
            con.query(sqlInfractions2, function (err, result) {
                if (err) {
                console.log(err);
                } else {
                console.log("1 record inserted into infractions.");
                }
            })
            con.query(sqlModLog2, function (err, result) {
                if (err) {
                console.log(err);
                } else {
                console.log("1 record inserted into mod_log.");
                }
            });    
        }, ms(lengthOfTime));
    },
};
