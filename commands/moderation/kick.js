const Discord = require('discord.js');
var dateFormat = require('dateformat');

module.exports = {
    name: "kick",
    description: "Kick a user",
    
    execute(msg, con, args) {
        if (!msg.member.roles.cache.some(
            role => role.name === "Admin" || role.name === "Moderator" || role.name === "Super User")) {
                return msg.reply("You must be an Admin, Moderator, or Super User to use this command.");
        }else{
            // Grabs the user and makes sure that one was provided
            const toKick = msg.mentions.members.first();
            if (!toKick) {
                return msg.reply("Please provide a user to kick.");
            }
            
            // Prevents you from kicking yourself
            if(msg.mentions.members.first() == msg.author) {
                return msg.reply("You can't kick yourself!")
            }

            // Checks that the person who is getting kicked doesn't have kick privileges
            if(toKick.hasPermission('KICK_MEMBERS')) {
                return msg.reply("This user also has kick privileges.")
            }

            // Checks that a reason was included
            const reason = msg.content.substr(msg.content.indexOf(">") + 2);
            if (reason === "") {
                return msg.reply("Please provide a reason for kicking.");
            }

            let now = new Date();
            let date = dateFormat(now, "yyyy-mm-dd HH:MM:ss");

            const action = "cc!kick " + args.join(" ")

            // Inserts row into database
            var sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES 
            ('${date}', '${toKick.id}', 'cc!kick', NULL, '${reason}', true, '${msg.author.id}');
            INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
            ('${date}', '${msg.author.id}', '${action}', NULL, '${reason}')`;
            con.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("1 record inserted");
                }
            });

            // Sends Audit Log Embed
            let channel = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs')

            const kickEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${toKick.user.username}#${toKick.user.discriminator} was kicked by ${msg.author.tag}:`)
            .setDescription(reason)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${toKick.user.id}/${toKick.user.avatar}.png`)
            .setTimestamp()
            .setFooter(`${msg.guild.name}`);

            channel.send(kickEmbed);

            // Actual Kick
            toKick.send("You've been kicked for the following reason: ```" + reason + " ```")
            toKick.kick({ reason })
            
            msg.reply(`${toKick} was kicked.`)
        }
    }
}
