const Discord = require('discord.js');
let dateFormat = require('dateformat');

function auditLog(message,targetUser,reason) {
	// Outputs a message to the audit-logs channel.
	let channel = message.guild.channels.cache.find(channel => channel.name === 'audit-logs')

	const warnEmbed = new Discord.MessageEmbed()
		.setColor('#f1d302')
		.setTitle(`${targetUser.user.username}#${targetUser.user.discriminator} was warned by ${message.author.tag}:`)
		.setDescription(reason)
		.setThumbnail(`https://cdn.discordapp.com/avatars/${targetUser.user.id}/${targetUser.user.avatar}.png`)
		.setTimestamp()
		.setFooter(`${message.guild.name}`);

	channel.send(warnEmbed);
}

module.exports = {
	name: 'warn',
	description: 'warns a user of an infraction and logs infraction in db',
	execute(msg,con,args) {
		// Make sure only SU, Mods and Admin can run the command
		if (!msg.member.roles.cache.some(
			role => role.name === "Super User" || role.name === "Moderator" || role.name === "Admin")) {
			  return msg.reply("You must be a moderator or admin to use this command.");
		} else {
			// get the user that was mentioned in the warning
			const offendingUser = msg.mentions.members.first();
	  
			// if no user was provided, return so the bot doesn't crash
			const failAttemptReply = [
			  "Ok there bud, who are you trying to warn again?",
			  "You definitely missed the targer user there...",
			  "shoot first ask later? You forgot the targer user",
			  "Not judging, but you didn't set a user to warn",
			  "Without a target user I can't warn anyone but you",
			  "Forgot the target user. Wanna try again?",
			  "Please tell you *do* know who to warn? You forgot the user"
			  ];
			
			// Make sure a target user is chosen, and that it isn't a SU, Mod, or Admin
			if (!offendingUser){
			  return msg.reply(failAttemptReply[Math.floor(Math.random() * failAttemptReply.length)]);
			} else if (offendingUser.roles.cache.some(
				role => role.name === "Super User" || role.name === "Moderator" || role.name === "Admin")) {
					return msg.reply("You cannot warn a super user, moderator or admin.");
			}

			// Prevent mod from self-warning
			if (offendingUser.id == msg.author.id) return msg.reply('Did you just try to warn yourself?');
	  
			// Parse the reason for the warning
			// if no reason provided, return so the bot doesn't go boom
			args.shift();
			const warningReason = args.join(" ");
			console.log(`warning reason: ${warningReason}`)
			if (!warningReason) return msg.reply('You need to provide a reason');
	  
			// Create an embed, craft it, and DM the user
			const Embed = new Discord.MessageEmbed()
				.setColor('#f1d302')
				.setTitle(`Warning to ${offendingUser.user.username}`)
				.setDescription(warningReason)
				.setTimestamp()
				.setFooter(`${msg.guild.name}`);
			offendingUser.send(Embed);

			// Add the infraction to the database
      		let now = new Date();
			let timestamp = dateFormat(now, "yyyy-mm-dd HH:MM:ss");

			const sqlInfractions = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES ('${timestamp}', '${offendingUser.id}', 'cc!warn', 'N/A', '${warningReason}', true, '${msg.author.id}')`;
			const sqlModLog = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES ('${timestamp}', '${msg.author.id}', '${msg}', 'N/A', '${warningReason}')`;
			
			// Register call in the Audit-log channel
			auditLog(msg,offendingUser,warningReason);

			// Give SU, Mod, Admin feedback on their call
			msg.channel.send(`${msg.author} just warned ${offendingUser}`);


			con.query(`${sqlInfractions}; ${sqlModLog}`, function (err, result) {
				if (err) {
				console.log(err);
				msg.channel.send(`I warned ${offendingUser} but writing to the db failed!`);
				} else {
				console.log("1 record inserted into infractions, 1 record inserted into mod_log.");
				}
			});
		}
	},
};
