const Discord = require('discord.js');
const dateFormat = require('dateformat');

module.exports = {
  name: 'mute',
  description: 'Mute a user',

  execute(msg, args, con) {
    const {status, err, toMute, reason} = canMute(msg, args);
    if (!status) {
      return msg.reply(err);
    }

    muteUser(msg, toMute, reason);
    auditLog(msg, toMute, reason);
    recordInDB(msg, toMute, reason, con);
  },
};

function canMute(message, args) {
  const data = {
    status: false,
    err: null,
    toMute: null,
    reason: null,
  };

  // Checks if user can perform command and validates message content.
  if (
    !message.member.roles.cache.some(
      (role) => role.name === 'Moderator' || role.name === 'Admin'
    )
  ) {
    data.err = 'You must be a moderator or admin to use this command.';
    return data;
  }

  data.toMute =
    message.mentions.members.first() ||
    message.guild.members.cache.get(args[0]);
  if (!data.toMute) {
    data.err = 'Please provide a user to mute.';
    return data;
  }
  if (data.toMute === message.member) {
    data.err = 'You cannot mute yourself.';
    return data;
  }
  if (
    data.toMute.roles.cache.some(
      (role) => role.name === 'Moderator' || role.name === 'Admin'
    )
  ) {
    data.err = 'You cannot mute a moderator or admin.';
    return data;
  }
  if (data.toMute.roles.cache.some((role) => role.name === 'Muted')) {
    data.err = 'This user is already muted.';
    return data;
  }

  data.reason = args.slice(1).join(' ');
  if (data.reason === '') {
    data.err = 'Please provide a reason for muting.';
    return data;
  }

  data.status = true;
  return data;
}

function muteUser(message, toMute, reason) {
  // Adds Muted role to user.
  toMute.roles.add(
    message.guild.roles.cache.find((role) => role.name === 'Muted')
  );
  message.channel.send(
    `${toMute} was muted by ${message.member}.\nReason: ${reason}`
  );

  // Sends user a DM notifying them of their muted status.
  toMute.send(
    "You've been muted for the following reason: ```" + reason + ' ```'
  );
}

function auditLog(message, toMute, reason) {
  // Outputs a message to the audit-logs channel.
  const channel = message.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const muteEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${toMute.user.username}#${toMute.user.discriminator} was muted by ${message.author.tag}:`
    )
    .setDescription(reason)
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${toMute.user.id}/${toMute.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter(`${message.guild.name}`);

  channel.send(muteEmbed);
}

function recordInDB(message, toMute, reason, connection) {
  const now = new Date();
  const timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) 
    VALUES (?, ?, 'cc!mute', NULL, ?, true, ?);
    INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) 
    VALUES (?, ?, ?, NULL, ?);`;

  const values = [
    timestamp,
    toMute.id,
    reason,
    message.author.id,
    timestamp,
    message.author.id,
    message.content,
    reason,
  ];
  const escaped = connection.format(sql, values);

  connection.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(
        '1 record inserted into infractions, 1 record inserted into mod_log.'
      );
    }
  });
}
