const Discord = require('discord.js');
var dateFormat = require('dateformat');

module.exports = {
    name: "unban",
    description: "Unban a user",
    
    execute(msg, args, con) {
        if (!msg.member.roles.cache.some(
            role => role.name === "Admin")) {
                return msg.reply("You must be an Admin to use this command.");
        }else{
            const toUnban = args[0];

            const action = "cc!unban " + args.join(" ")
            let now = new Date();
            let date = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
            // Inserts row into database
            var sql = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
                        ('${date}', '${msg.author.tag}', '${action}', 'N/A', 'N/A')`;
            con.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("1 record inserted");
                }
            });

            // Sends Audit Log Embed
            let channel = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs')

            const unbanEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${toUnban} was unbanned by ${msg.author.tag}:`)
            .setTimestamp()
            .setFooter(`${msg.guild.name}`);

            channel.send(unbanEmbed);

            msg.guild.members.unban(toUnban)
            msg.reply(`${toUnban} was unbanned.`)
        }
    }
}
