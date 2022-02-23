const Discord = require('discord.js');
const dateFormat = require('dateformat');

module.exports = {
  name: 'unmute',
  description: 'Unmute a user',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Moderator',

  execute(msg, args, con) {
    const {status, err, toUnmute} = canUnmute(msg, args);
    if (!status) {
      return msg.reply({content: err});
    }

    unmuteUser(msg, toUnmute);
    auditLog(msg, toUnmute);
    recordInDB(msg, con);
  },
};

function canUnmute(message, args) {
  const data = {
    status: false,
    err: null,
    toUnmute: null,
  };
  // Checks if user can perform command and validates message content.
  data.toUnmute =
    message.mentions.members.first() ||
    message.guild.members.cache.get(args[0]);
  if (!data.toUnmute) {
    data.err = 'Please provide a user to unmute.';
    return data;
  }
  if (!data.toUnmute.roles.cache.some((role) => role.name === 'On Mute')) {
    data.err = 'This user is already unmuted.';
    return data;
  }

  data.status = true;
  return data;
}

function unmuteUser(message, toUnmute) {
  // Removes Muted role from user.
  toUnmute.roles.remove(
    message.guild.roles.cache.find((role) => role.name === 'On Mute')
  );
  message.channel.send({content: `${toUnmute} was unmuted.`});

  // Sends user a DM notifying them of their unmuted status.
  toUnmute.send({content: "You've been unmuted."});
}

function auditLog(message, toUnmute) {
  // Outputs a message to the audit-logs channel.
  const channel = message.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const unmuteEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${toUnmute.user.username}#${toUnmute.user.discriminator} was unmuted by ${message.author.tag}:`
    )
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${toUnmute.user.id}/${toUnmute.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter(`${message.guild.name}`);

  channel.send({embeds: [unmuteEmbed]});
}

function recordInDB(message, connection) {
  const now = new Date();
  const timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const sql = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason)
    VALUES (?, ?, ?, NULL, NULL);`;

  const values = [timestamp, message.author.id, message.content];
  const escaped = connection.format(sql, values);

  connection.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('1 record inserted into mod_log.');
    }
  });
}
