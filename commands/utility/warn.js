const Discord = require('discord.js');
let dateFormat = require('dateformat');

module.exports = {
	name: 'warn',
	description: 'warns a user of an infraction and logs infraction in db',
	execute(msg,con,args) {
		// Make sure only SU, Mods and Admin can run the command
		const offendingUser = msg.mentions.members.first();
		if (canWarn(msg)){
			if (hasUserTarget(msg,offendingUser) && notHighRoller(msg,offendingUser) && notSelf(msg,offendingUser)) {
				// Parse the reason for the warning
				// if no reason provided, return so the bot doesn't go boom
				const warningReason = args.slice(1).join(" ");
				if (!warningReason) return msg.reply('You need to provide a reason');
		
				// Create an embed, craft it, and DM the user
				dmTheUser(msg,offendingUser,warningReason);

				// Register call in the Audit-log channel
				auditLog(msg,offendingUser,warningReason);

				// Give SU, Mod, Admin feedback on their call
				msg.channel.send(`${msg.author} just warned ${offendingUser}`);

				// Add the infraction to the database
				recordInDB(msg,con,offendingUser,warningReason);
			}
		}
	},
};


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

function dmTheUser(msg,targetUser,reason){
	// Create an embed, craft it, and DM the user
	const Embed = new Discord.MessageEmbed()
		.setColor('#f1d302')
		.setTitle(`Warning to ${targetUser.user.username}`)
		.setDescription(reason)
		.setTimestamp()
		.setFooter(`${msg.guild.name}`);
	targetUser.send(Embed);
}

function recordInDB(msg,con,offendingUser,warningReason){
	// Add the infraction to the database
	let now = new Date();
	let timestamp = dateFormat(now, "yyyy-mm-dd HH:MM:ss");

	const sqlInfractions = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES ('${timestamp}', '${offendingUser.id}', 'cc!warn', 'NULL', '${warningReason}', true, '${msg.author.id}')`;
	const sqlModLog = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES ('${timestamp}', '${msg.author.id}', '${msg}', 'NULL', '${warningReason}')`;

	con.query(`${sqlInfractions}; ${sqlModLog}`, function (err, result) {
		if (err) {
			console.log(err);
			// Include a warning in case something goes wrong writing to the db
			msg.channel.send(`I warned ${offendingUser} but writing to the db failed!`);
		} else {
			console.log("1 record inserted into infractions, 1 record inserted into mod_log.");
		}
	});
}

function canWarn(msg) {
	if (!msg.member.roles.cache.some(
		role => role.name === "Super User" || role.name === "Moderator" || role.name === "Admin")) {
		msg.reply("You must be a Super User, Moderator or Admin to use this command.");
		return false;
	} else {
		return true;
	}
}

function hasUserTarget(msg,offendingUser) {
	// Asortment of answers to make the bot more fun
	const failAttemptReply = [
		"Ok there bud, who are you trying to warn again?",
		"You definitely missed the targer user there...",
		"shoot first ask later? You forgot the targer user",
		"Not judging, but you didn't set a user to warn",
		"Without a target user I can't warn anyone but you",
		"Forgot the target user. Wanna try again?",
		"Please tell you *do* know who to warn? You forgot the user"
		];

	if (offendingUser){
		return true;
	} else {
		msg.reply(failAttemptReply[Math.floor(Math.random() * failAttemptReply.length)]);
		return false;
	}
}

function notHighRoller (msg,offendingUser){
	if (offendingUser.roles.cache.some(
		role => role.name === "Super User" || role.name === "Moderator" || role.name === "Admin")) {
			msg.reply("You cannot warn a super user, moderator or admin.");
			return false;
	} else {
		return true;
	}
}

function notSelf(msg,offendingUser) {
	if (offendingUser.id == msg.author.id){
		msg.reply('Did you just try to warn yourself?');
		return false;
	} else {
		return true;
	}
}

