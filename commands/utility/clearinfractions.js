const Discord = require('discord.js');
const dateFormat = require('dateformat');

module.exports = {
  name: 'clearinfractions',
  description: 'Removes all infractions from a user',

  execute(msg, con, args) {
    const {status, err, userInfraction} = validInfraction(msg, args);
    if (!status) {
      return msg.reply(err);
    }

    findInfractions(msg, userInfraction, args, con);
  },
};

function validInfraction(msg, args) {
  const data = {
    status: false,
    err: null,
    userInfraction: null,
  };

  if (!msg.member.roles.cache.some((role) => role.name === 'Admin')) {
    data.err = 'You must be an Admin to use this command.';
    console.log(data);
    return data;
  }

  data.userInfraction =
    msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
  if (!data.userInfraction) {
    data.err = 'Please provide a user to remove infractions.';
    return data;
  }

  data.status = true;
  return data;
}

function findInfractions(msg, userInfraction, args, con) {
  const sql = `SELECT COUNT(id) FROM infractions WHERE user = ? AND valid = ?;`;

  const values = [userInfraction.id, true];

  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result[0]['COUNT(id)'] > 0) {
        clearInfractionSQL(msg, userInfraction, args, con);
      } else {
        msg.reply('This user does not have any infractions');
      }
    }
  });
}

function clearInfractionSQL(msg, userInfraction, args, con) {
  const now = new Date();
  const date = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const action = 'cc!clearinfractions ' + args.join(' ');

  // Inserts row into database
  const sql = `UPDATE infractions SET valid = ? WHERE user = ?;
    INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
    (?, ?, ?, NULL, NULL);`;

  const values = [false, userInfraction.id, date, msg.author.id, action];
  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('Infractions were removed from user');
      if (result[0].affectedRows >= 1) {
        clearInfractionResponse(msg, userInfraction);
        clearInfractionEmbed(msg, userInfraction);
      }
    }
  });
}

function clearInfractionEmbed(msg, userInfraction) {
  // Sends Audit Log Embed
  const channel = msg.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const userInfractionEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${msg.author.tag} cleared all ${userInfraction.user.username}#${userInfraction.user.discriminator} infractions`
    )
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${userInfraction.user.id}/${userInfraction.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter(`${msg.guild.name}`);

  channel.send(userInfractionEmbed);
}

function clearInfractionResponse(msg, userInfraction) {
  msg.reply(`All infractions were removed from ${userInfraction}.`);
}
