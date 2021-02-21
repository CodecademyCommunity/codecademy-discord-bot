const Discord = require('discord.js');
const ms = require('ms');
var dateFormat = require('dateformat');

module.exports = {
    name: "tempban",
    description: "Temporarily ban a user",
    
    execute(msg, args, con) {
        const user_information = /(\<@!?\d+\>)\s(\d+[yhwdms])\s(.+)$/

        if (!msg.member.roles.cache.some(
            role => role.name === "Admin" || role.name === "Moderator")) {
                return msg.reply("You must be an Admin to use this command.");
        }else{

            if(!args.join(" ").match(user_information)) {
                return msg.reply("The command you sent isn't in a valid format")
            }

            const [, id, timeLength, reason] = args.join(" ").match(user_information) ?? []

            const toTempBan = msg.mentions.members.first();
            if (!toTempBan) {
                return msg.reply("Please provide a user to temporarily ban.");
            }

            if(toTempBan.hasPermission('BAN_MEMBERS')) {
                return msg.reply("This user also has ban privileges.")
            }            

            // const reason = args.slice(args.indexOf(timeLength[0]) + 1).join(" ")
            console.log(reason)
            if (reason === "") {
                return msg.reply("Please provide a reason for temporarily banning this user.");
            }

            let now = new Date();
            let date = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
            const action = "cc!tempban " + args.join(" ")
            // Inserts row into database
            var sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES
            ('${date}', '${toTempBan}', 'cc!tempban', '${timeLength}', '${reason}', true, '${msg.author.tag}');
            INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
            ('${date}', '${msg.author.tag}', '${action}', '${timeLength}', '${reason}');`;
            con.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("1 record inserted");
                }
            });
            
            // Sends Audit Log Embed
            let channel = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs')

            const tempBanEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${toTempBan.user.username}#${toTempBan.user.discriminator} was banned by ${msg.author.tag} for ${timeLength}:`)
            .setDescription(reason)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${toTempBan.user.id}/${toTempBan.user.avatar}.png`)
            .setTimestamp()
            .setFooter(`${msg.guild.name}`);

            channel.send(tempBanEmbed)

            const tempUnBanEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${toTempBan.user.username}#${toTempBan.user.discriminator} was unbanned by after ${timeLength}:`)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${toTempBan.user.id}/${toTempBan.user.avatar}.png`)
            .setTimestamp()
            .setFooter(`${msg.guild.name}`);

            // Banning member and sending him a DM with a form to refute the ban and the reason
            toTempBan.send("You've been banned for " + timeLength + " for the following reason: ```" + reason + " ``` If you wish to challenge this ban, please submit a response in this Google Form: https://docs.google.com/forms/d/e/1FAIpQLSc1sx6iE3TYgq_c4sALd0YTkL0IPcnkBXtR20swahPbREZpTA/viewform")
            toTempBan.ban({ reason })
            
            msg.reply(`${toTempBan} was banned for ${timeLength}.`)

            setTimeout(() => {
                msg.guild.members.unban(toTempBan)
                channel.send(tempUnBanEmbed);

                date = dateFormat(now, "yyyy-mm-dd HH:MM:ss");

                var mod_log_tempban = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) 
                VALUES ('${date}', 'automatic', 'cc!unban', 'N/A', 'tempban expired')`;

                con.query(mod_log_tempban, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("1 record inserted into mod_log.");
                    }
                });
            }, ms(timeLength));
        }
    }
}
