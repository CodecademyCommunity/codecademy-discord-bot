const Discord = require('discord.js');
let dateFormat = require('dateformat');

module.exports = {
	name: 'infractions',
	description: 'finds user infraction record in db and returns it to channel',
	execute(msg,con) {
		// Make sure only SU, Mods and Admin can run the command
		const targetUser = msg.mentions.members.first();
		if (canWarn(msg)){
			if (hasUserTarget(msg,targetUser)) {
				// Find all infraction records in database
				const infractions = infractionsInDB(msg,con,targetUser);

				// Send list of infractions back to channel
				infractionLog(msg,targetUser,infractions);
			}
		}
	},
};


function infractionLog(message,targetUser,infractions) {

	const infractionsEmbed = new Discord.MessageEmbed()
		.setColor('#2e294e')
		.setTitle(`${targetUser.user.username}#${targetUser.user.discriminator} has the following infractions`)
		.setDescription(infractions)
		.setThumbnail(`https://cdn.discordapp.com/avatars/${targetUser.user.id}/${targetUser.user.avatar}.png`)
		.setTimestamp()
		.setFooter(`${message.guild.name}`);

	msg.channel.send(infractionsEmbed);
}

function infractionsInDB(msg,con,targetUser){
	// Find infractions in database

	const sqlInfractions = `SELECT reason FROM infractions WHERE user = '${targetUser.id};`;

	con.query(`${sqlInfractions}`, function (err, result) {
		if (err) {
			console.log(err);
			// Include a warning in case something goes wrong writing to the db
			msg.channel.send(`I couldn't read ${targetUser}'s infractions from the db!`);
		} else {
			console.log("Found infraction records.");
			return result;
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

function hasUserTarget(msg,targetUser) {
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

	if (targetUser){
		return true;
	} else {
		msg.reply(failAttemptReply[Math.floor(Math.random() * failAttemptReply.length)]);
		return false;
	}
}
