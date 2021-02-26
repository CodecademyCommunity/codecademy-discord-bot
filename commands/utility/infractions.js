const Discord = require('discord.js');

module.exports = {
	name: 'infractions',
	description: 'finds user infraction record in db and returns it to channel',
	execute(msg,con) {
		// Make sure only SU, Mods and Admin can run the command
		const targetUser = msg.mentions.members.first();
		if (canCheckInfractions(msg)){
			if (hasUserTarget(msg,targetUser)) {
				// Find all infraction records in database
				// Because of async, call infractionLog from infractionsInDB
				infractionsInDB(msg,con,targetUser);

			}
		}
	},
};


function infractionsInDB(msg,con,targetUser){
	// Find inractions in database
	const sqlInfractions = `SELECT timestamp,reason FROM infractions WHERE user = '${targetUser.id}';`;

	con.query(`${sqlInfractions}`, function (err, result) {
		if (err) {
			console.log(err);
			// Include a warning in case something goes wrong writing to the db
			msg.channel.send(`I couldn't read ${targetUser}'s infractions from the db!`);
		} else {
			console.log("Found infraction records.");
			infractionLog(msg,targetUser,result);
		}
	});
}

function infractionLog(msg,targetUser,infractions) {
	// parse infractions into an array
	const infractionsList = infractions.map(infraction => [infraction.timestamp,infraction.reason]);

	// Get properties from the list
	const totalInfractions = infractionsList.length;
	const hasMoreThan5 = infractionsList.length > 5;
	const timestampList = infractionsList.map(infraction => infraction[0]);
	const reasonsList = infractionsList.map(infraction => infraction[1]);

	// Format timestamps to work backwards from current time
	// First convert to millisecs, then compare with current time
	timestampList.forEach((time, idx) => timestampList[idx] = Date.parse(time));
	const now = Date.now();
	const timeSinceInfraction = timestampList.map(time => now - time); // elapsed time
	timeSinceInfraction.forEach((time,idx) => {
		timeSinceInfraction[idx] = [
			`${typeof time}`,
			`${Math.round(time)}`,
			`${Math.round(time /= 1000)}`,
			`${Math.round(time /= 1000) % 60}`
		]
		});
	console.log(timeSinceInfraction);
	

	const infractionsEmbed = new Discord.MessageEmbed()
		.setAuthor(`${targetUser.user.username}#${targetUser.user.discriminator}'s infractions`,
			`https://cdn.discordapp.com/avatars/${targetUser.user.id}/${targetUser.user.avatar}.png`)
		.setColor('#c5d86d')
		.addField(`Last 24h`,`test`,true)
		.addField(`Last 7 days`,`test`,true)
		.addField(`Total`,`${totalInfractions}`,true)
		.addField(`Latest infractions: `,`${reasonsList} - ${timestampList}`)
		.setTimestamp()
		.setFooter(`${msg.guild.name}`);
		// if (infractions.length){
		// 	let counter = 1;
		// 	infractions.forEach(infraction => {
		// 	infractionsEmbed.addField(`Infraction: ${counter}`,infraction.reason);
		// 	counter++;
		//   });
		// } else {
		// 	infractionsEmbed.setDescription(`${targetUser.user.username}#${targetUser.user.discriminator} doesn't appear to have infractions.`);
		// }
		

	msg.channel.send(infractionsEmbed);
}

function canCheckInfractions(msg) {
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
		"Ok there bud, whose infractions are you trying to check again?",
		"You definitely missed the targer user there...",
		"what? You want ALL the infractions from everyone? You forgot the targer user",
		"Not judging, but you didn't set a user to read infractions from...",
		"You forgot the targer user, so maybe YOU should have an infraction",
		"Forgot the target user. Wanna try again?",
		"Here I was thinking this command was easy enough. You forgot the target user"
		];

	if (targetUser){
		return true;
	} else {
		msg.reply(failAttemptReply[Math.floor(Math.random() * failAttemptReply.length)]);
		return false;
	}
}
