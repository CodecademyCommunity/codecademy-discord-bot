const Discord = require('discord.js');
const dateFormat = require('dateformat');
const ms = require('ms');
const {verifyReasonLength} = require('../../helpers/stringHelpers');
const {hasTargetUser} = require('../../helpers/hasTargetUser');

module.exports = {
  name: 'tempmute',
  description: 'Temporarily mute a user',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Moderator',

  execute(msg, args, con) {
    const targetUser =
      msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
    if (hasTargetUser(msg, targetUser, 'temp mute')) {
      const {status, err, toTempMute, lengthOfTime, reason} = canTempMute(
        msg,
        args
      );
      if (!status) {
        return msg.reply(err);
      }

      if (!verifyReasonLength(msg.content, msg)) return;

      // Mutes user.
      muteUser(msg, toTempMute, lengthOfTime, reason);
      auditLogMute(msg, toTempMute, lengthOfTime, reason);
      recordMuteInDB(msg, toTempMute, lengthOfTime, reason, con);
      // Unmutes user after specified time period.
      setTimeout(() => {
        unmuteUser(msg, toTempMute);
        auditLogUnmute(msg, toTempMute, lengthOfTime);
        recordUnmuteInDB(toTempMute, con);
      }, ms(lengthOfTime));
    }
  },
};

function canTempMute(message, args) {
  const data = {
    status: false,
    err: null,
    toTempMute: null,
    userID: null,
    lengthOfTime: null,
    reason: null,
  };
  // Checks if user can perform command and validates message content.

  const commandRegex = /((<@!?)?\d{17,}>?)\s(\d+[yhwdms])\s(.+)$/;
  if (!args.join(' ').match(commandRegex)) {
    data.err = "The command you sent isn't in a valid format.";
    return data;
  }

  let reasonArray = null;
  [data.userID, data.lengthOfTime, ...reasonArray] = args;
  data.reason = reasonArray.join(' ');

  data.toTempMute =
    message.mentions.members.first() ||
    message.guild.members.cache.get(args[0]);
  if (data.toTempMute === message.member) {
    data.err = 'You cannot temporarily mute yourself.';
    return data;
  }
  if (
    data.toTempMute.roles.cache.some(
      (role) =>
        role.name === 'Forums Super User' ||
        role.name === 'Moderator' ||
        role.name === 'Admin' ||
        role.name === 'Super Admin'
    )
  ) {
    data.err = 'You cannot temporarily mute a moderator or admin.';
    return data;
  }
  if (data.toTempMute.roles.cache.some((role) => role.name === 'Muted')) {
    data.err = 'This user is already muted.';
    return data;
  }

  data.status = true;
  return data;
}

function muteUser(message, toTempMute, lengthOfTime, reason) {
  // Adds Muted role to user.
  toTempMute.roles.add(
    message.guild.roles.cache.find((role) => role.name === 'Muted')
  );
  message.channel.send(
    `${toTempMute} was muted by ${message.member} for ${lengthOfTime}.\nReason: ${reason}`
  );

  // Sends user a DM notifying them of their muted status.
  toTempMute.send(
    "You've been muted for " +
      ms(ms(lengthOfTime), {long: true}) +
      ' for the following reason: ```' +
      reason +
      ' ```'
  );
}

function unmuteUser(message, toTempMute) {
  toTempMute.roles.remove(
    message.guild.roles.cache.find((role) => role.name === 'Muted')
  );
  toTempMute.send("You've been unmuted.");
}

function auditLogMute(message, toTempMute, lengthOfTime, reason) {
  // Outputs a message to the audit-logs channel.
  const channel = message.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const tempmuteEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${toTempMute.user.username}#${
        toTempMute.user.discriminator
      } was muted by ${message.author.tag} for ${ms(ms(lengthOfTime), {
        long: true,
      })}:`
    )
    .setDescription(reason)
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${toTempMute.user.id}/${toTempMute.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter(`${message.guild.name}`);

  channel.send(tempmuteEmbed);
}

function auditLogUnmute(message, toTempMute, lengthOfTime) {
  const channel = message.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const tempUnmuteEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${toTempMute.user.username}#${
        toTempMute.user.discriminator
      } was unmuted after ${ms(ms(lengthOfTime), {long: true})}:`
    )
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${toTempMute.user.id}/${toTempMute.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter(`${message.guild.name}`);

  channel.send(tempUnmuteEmbed);
}

function recordMuteInDB(message, toTempMute, lengthOfTime, reason, connection) {
  const now = new Date();
  const timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) 
    VALUES (?, ?, 'cc!tempmute', ?, ?, true, ?);
    INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) 
    VALUES (?, ?, ?, ?, ?);`;

  const values = [
    timestamp,
    toTempMute.id,
    lengthOfTime,
    reason,
    message.author.id,
    timestamp,
    message.author.id,
    message.content,
    lengthOfTime,
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

function recordUnmuteInDB(toTempMute, connection) {
  const now = new Date();
  const timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const sql2 = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) 
    VALUES (?, 'automatic', ?, NULL, 'tempmute expired')`;

  const values2 = [timestamp, `cc!unmute ${toTempMute}`];
  const escaped2 = connection.format(sql2, values2);

  connection.query(escaped2, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('1 record inserted into mod_log.');
    }
  });
}
