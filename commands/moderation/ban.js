const Discord = require('discord.js');
var dateFormat = require('dateformat');

module.exports = {
    name: "ban",
    description: "Ban a user",
    
    execute(msg, con, args) {
        if (!msg.member.roles.cache.some(
            role => role.name === "Admin")) {
                return msg.reply("You must be an Admin to use this command.");
        }else{
            const toBan = msg.mentions.members.first();
            if (!toBan) {
                return msg.reply("Please provide a user to ban.");
            }

            if(toBan.hasPermission('BAN_MEMBERS')) {
                return msg.reply("This user also has ban privileges.")
            }

            const reason = msg.content.substr(msg.content.indexOf(">") + 2);
            if (reason === "") {
                return msg.reply("Please provide a reason for banning.");
            }
            
            let now = new Date();
            let date = dateFormat(now, "yyyy-mm-dd HH:MM:ss");

            const action = "cc!ban " + args.join(" ")

            console.log(action)
            // Inserts row into database
            var sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES 
            ('${date}', '${toBan}', 'cc!ban', 'N/A', '${reason}', true, '${msg.author.tag}');
            INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
            ('${date}', '${msg.author.tag}', '${action}', 'N/A', '${reason}')`;
            con.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("1 record inserted");
                }
            });

            // Sends Audit Log Embed
            let channel = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs')

            const banEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${toBan.user.username}#${toBan.user.discriminator} was banned by ${msg.author.tag}:`)
            .setDescription(reason)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${toBan.user.id}/${toBan.user.avatar}.png`)
            .setTimestamp()
            .setFooter(`${msg.guild.name}`);

            channel.send(banEmbed);

            // Banning member and sending him a DM with a form to refute the ban and the reason
            toBan.send("You've been banned for the following reason: ```" + reason + " ``` If you wish to challenge this ban, please submit a response in this Google Form: https://docs.google.com/forms/d/e/1FAIpQLSc1sx6iE3TYgq_c4sALd0YTkL0IPcnkBXtR20swahPbREZpTA/viewform")
            toBan.ban({ reason })
            
            msg.reply(`${toBan} was banned.`)
        }
    }
}
