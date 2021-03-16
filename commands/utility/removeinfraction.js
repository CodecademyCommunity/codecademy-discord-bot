const Discord = require('discord.js');
const dateFormat = require('dateformat');

module.exports = {
  name: 'removeinfraction',
  description: 'Removes a specific infraction based on the ID provided',

  execute(msg, con, args) {
    const {status, err, userInfraction, infractionID} = validInfraction(
      msg,
      args
    );
    if (!status) {
      return msg.reply(err);
    }

    validateInfractionID(msg, userInfraction, args, infractionID, con);
  },
};

function validInfraction(msg, args) {
  const data = {
    status: false,
    err: null,
    userInfraction: null,
    infractionID: null,
  };

  if (
    !msg.member.roles.cache.some(
      (role) => role.name === 'Admin' || role.name === 'Moderator'
    )
  ) {
    data.err = 'You must be an Admin or Moderator to use this command.';
    return data;
  }

  data.userInfraction =
    msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
  if (!data.userInfraction) {
    data.err = 'Please provide a user to remove this infraction from.';
    return data;
  }
  console.log(args);
  data.infractionID = args[1];
  if (data.infractionID === '') {
    data.err = 'Please provide a infraction ID to remove.';
    return data;
  }

  data.status = true;
  return data;
}

function validateInfractionID(msg, userInfraction, args, infractionID, con) {
  const sql = `SELECT id, valid FROM infractions WHERE id = ?;`;

  const values = [infractionID];

  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result[0] && result[0].valid != 0) {
        infractionSQL(msg, userInfraction, infractionID, args, con);
      } else if (result[0] && result[0].valid == 0) {
        msg.reply('Please include a valid infraction ID');
      } else {
        msg.reply('Please include a valid infraction ID');
      }
    }
  });
}

function infractionSQL(msg, userInfraction, infractionID, args, con) {
  const now = new Date();
  const date = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const action = 'cc!removeinfraction ' + args.join(' ');

  // Inserts row into database
  const sql = `UPDATE infractions SET valid = ? WHERE id = ?;
    INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
    (?, ?, ?, NULL, NULL);`;

  const values = [false, infractionID, date, msg.author.id, action];
  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('Infraction was set to invalid');
      if (result[0].affectedRows == 1) {
        infractionResponse(msg, userInfraction, infractionID);
        infractionEmbed(msg, userInfraction, infractionID);
      }
    }
  });
}

function infractionEmbed(msg, userInfraction, infractionID) {
  // Sends Audit Log Embed
  const channel = msg.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const userInfractionEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${msg.author.tag} removed an infraction from ${userInfraction.user.username}#${userInfraction.user.discriminator}`
    )
    .setDescription('Infraction: #' + infractionID)
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${userInfraction.user.id}/${userInfraction.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter(`${msg.guild.name}`);

  channel.send(userInfractionEmbed);
}

function infractionResponse(msg, userInfraction, infractionID) {
  msg.reply(`Infraction #${infractionID} was removed from ${userInfraction}.`);
}
