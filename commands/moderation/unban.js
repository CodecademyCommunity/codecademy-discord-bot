const Discord = require('discord.js');
var dateFormat = require('dateformat');

module.exports = {
    name: "unban",
    description: "Unban a user",
    
    async execute(msg, args, con) {
        if (!msg.member.roles.cache.some(
            role => role.name === "Admin")) {
                return msg.reply("You must be an Admin to use this command.");
        }else{
            let channel = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs')

            const toUnban = args[0];

            if(!toUnban) {
                return msg.reply("Please include a user ID to unban.")
            }

            if(msg.client.users.fetch(toUnban) == msg.author) {
                return msg.reply("You can't unban yourself!")
            }

            try {
                await msg.guild.members.unban(toUnban)
            } catch (error) {
                if(error.code == 10026) {
                    return msg.reply("This user is not banned.")
                }
            }

            const action = "cc!unban " + args.join(" ")
            let now = new Date();
            let date = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
            // Inserts row into database
            var sql = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
                        ('${date}', '${msg.author.id}', '${action}', 'N/A', 'N/A')`;
            con.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("1 record inserted");
                }
            });

            // Sends Audit Log Embed

            const unbanEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${toUnban} was unbanned by ${msg.author.tag}:`)
            .setTimestamp()
            .setFooter(`${msg.guild.name}`);

            channel.send(unbanEmbed);


            msg.reply(`${toUnban} was unbanned.`)
        }
    }
}
