const Discord = require('discord.js');
const {hasTargetUser} = require('../../helpers/hasTargetUser');

module.exports = {
  name: 'infractions',
  description: 'finds user infraction record in db and returns it to channel',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Moderator',
  execute(msg, args, con) {
    // Make sure only SU, Mods and Admin can run the command
    const targetUser =
      msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

    if (hasTargetUser(msg, targetUser, 'read infractions from')) {
      // Find all infraction records in database
      // Because of async, call infractionLog from infractionsInDB
      infractionsInDB(msg, con, targetUser);
    }
  },
  infractionsInDB: infractionsInDB,
};

function infractionsInDB(msg, con, targetUser) {
  // Find inractions in database
  const sqlInfractions = `SELECT timestamp,reason,id,action,valid FROM infractions WHERE user = '${targetUser.id}';`;

  con.query(`${sqlInfractions}`, function (err, result) {
    if (err) {
      console.log(err);
      // Include a warning in case something goes wrong writing to the db
      msg.channel.send({
        content: `I couldn't read ${targetUser}'s infractions from the db!`,
      });
    } else {
      console.log('Found infraction records.');
      infractionLog(msg, targetUser, result);
    }
  });
}

function infractionLog(msg, targetUser, infractions) {
  const listOfInfractions = parseInfractions(infractions);

  // Get properties from the list
  const totalInfractions = listOfInfractions.length;

  // Set some colors for the embed
  const embedFlair = [
    '#f8f272',
    '#f98948',
    '#a23e48',
    '#6096ba',
    '#86a873',
    '#d3b99f',
    '#6e6a6f',
  ];
  if (totalInfractions) {
    const infractionsEmbed = new Discord.MessageEmbed()
      .setAuthor({
        name: `${targetUser.user.username}#${targetUser.user.discriminator}'s infractions`,
        iconURL: `https://cdn.discordapp.com/avatars/${targetUser.user.id}/${targetUser.user.avatar}.png`,
      })
      .setColor(embedFlair[Math.floor(Math.random() * embedFlair.length)])
      .setDescription(`Total: ${totalInfractions}`)
      .addFields(...listOfInfractions)
      .setTimestamp()
      .setFooter({text: `${msg.guild.name}`});

    msg.channel.send({embeds: [infractionsEmbed]});
  } else {
    msg.reply({
      content: `${targetUser.user.username}#${targetUser.user.discriminator} doesn't have any infractions`,
    });
  }
}

function parseInfractions(infractions) {
  // parse infractions into an array
  const infractionsList = infractions.map((infraction) => [
    infraction.timestamp,
    infraction.reason,
    infraction.id,
    infraction.action,
    infraction.valid,
  ]);
  const timestampList = infractionsList.map((infraction) => infraction[0]);
  const reasonsList = infractionsList.map((infraction) => infraction[1]);
  const idList = infractionsList.map((infraction) => infraction[2]);
  const actionList = infractionsList.map((infraction) => infraction[3]);
  const validList = infractionsList.map((infraction) => infraction[4]);

  // Format timestamps to work backwards from current time
  // First convert to millisecs, then compare with current time
  timestampList.forEach((time, idx) => (timestampList[idx] = Date.parse(time)));
  const now = Date.now();
  const timeSinceInfraction = timestampList.map((time) => now - time); // elapsed time
  timeSinceInfraction.forEach((time, idx) => {
    const seconds = time / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    if (Math.floor(days) > 0) {
      timeSinceInfraction[idx] = [
        `${Math.floor(days)}d ${Math.round(days % 24)}h`,
      ];
    } else if (Math.floor(hours) > 0) {
      timeSinceInfraction[idx] = [
        `${Math.floor(hours)}h ${Math.round(hours % 60)}m`,
      ];
    } else {
      timeSinceInfraction[idx] = [
        `${Math.floor(minutes)}m ${Math.round(minutes % 60)}s`,
      ];
    }
  });

  // Join reasonsList with timeSinceInfraction
  // This lets us print out the embedded message so much better
  const reasonsWithTimes = [];
  for (let i = 0; i < reasonsList.length; i++) {
    if (validList[i])
      reasonsWithTimes.push({
        name: `ID: ${idList[i]}   ${actionList[i]}   ${timeSinceInfraction[i]} ago`,
        value: `${reasonsList[i]}`,
      });
  }
  return reasonsWithTimes;
}
