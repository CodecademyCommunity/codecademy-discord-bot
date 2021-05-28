const Discord = require('discord.js');
const dateFormat = require('dateformat');

module.exports = {
  name: 'clearmessages',
  description: 'Clears a certain number of messages',
  guildOnly: true,

  execute(msg, args, con) {
    const {status, err, numberDeleted} = validClear(msg, args);
    if (!status) {
      return msg.reply(err);
    }

    clearMessage(msg, numberDeleted);
    clearSQL(msg, numberDeleted, con);
    clearEmbed(msg, numberDeleted);
  },
};

function validClear(msg, args) {
  const data = {
    status: false,
    err: null,
    numberDeleted: null,
    reason: null,
  };

  if (
    !msg.member.roles.cache.some(
      (role) => role.name === 'Admin' || role.name === 'Moderator'
    )
  ) {
    data.err = 'You must be an Admin or a Moderator to use this command.';
    return data;
  }

  data.numberDeleted = args[0];
  if (isNaN(args[0])) {
    data.err = 'Please provide a number of messages to delete.';
    return data;
  }

  if (args[0] > 100) {
    data.err = 'You can only delete a max of a hundred messages';
    return data;
  }

  data.status = true;
  return data;
}

function clearSQL(msg, numberDeleted, con) {
  const now = new Date();
  const date = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const action = 'cc!clear ' + numberDeleted;

  // Inserts row into database
  const sql = `
    INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
    (?, ?, ?, NULL, NULL);`;

  const values = [date, msg.author.id, action];

  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('1 record inserted');
    }
  });
}

function clearEmbed(msg, numberDeleted) {
  // Sends Audit Log Embed
  const channel = msg.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const banEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${msg.author.tag} deleted ${numberDeleted} messages in #${msg.channel.name}`
    )
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
    )
    .setTimestamp()
    .setFooter(`${msg.guild.name}`);

  channel.send(banEmbed);
}

function clearMessage(msg, numberDeleted) {
  msg.channel.bulkDelete(parseInt(numberDeleted) + 1);

  msg.channel.send(`${numberDeleted} messages were deleted.`);
}
