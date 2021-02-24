const Discord = require('discord.js');
let dateFormat = require('dateformat');

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
			if (!offendingUser){
			  return msg.reply(failAttemptReply[Math.floor(Math.random() * failAttemptReply.length)]);
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

			var sqlInfractions = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES ('${timestamp}', '${offendingUser.id}', 'cc!warn', 'N/A', '${warningReason}', true, '${msg.author.id}')`;

			var sqlModLog = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES ('${timestamp}', '${msg.author.id}', '${msg}', 'N/A', '${warningReason}')`;

			con.query(`${sqlInfractions}; ${sqlModLog}`, function (err, result) {
				if (err) {
				console.log(err);
				} else {
				console.log("1 record inserted into infractßions, 1 record inserted into mod_log.");
				}
			});
		}
	},
};
