const Discord = require('discord.js');
const dateformat = require('dateformat');
const ms = require('ms');
const {verifyReasonLength} = require('../../helpers/stringHelpers');

module.exports = {
  name: 'timeout',
  description: 'Timeout a user',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Moderator',

  async execute(msg, args, con) {
    const {status, err, toTimeout, duration, reason} = canTimeout(msg, args);
    if (!status) {
      return msg.reply({content: err});
    }

    if (!verifyReasonLength(msg.content, msg)) return;

    timeoutUser(msg, toTimeout, duration, reason);
    auditLogTimeout(msg, toTimeout, duration, reason);
    recordTimeoutInDB(msg, toTimeout, duration, reason, con);
    try {
      await dmTheUser(msg, toTimeout, duration, reason);
    } catch (e) {
      return msg.reply(`${e.name}: ${e.message}`);
    }
  },
};

// Validates data.
function canTimeout(msg, args) {
  const data = {
    status: false,
    err: null,
    toTimeout: null,
    duration: null,
    reason: null,
  };

  // Check if targeted user is valid and can be timed out.
  data.toTimeout =
    msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
  if (!data.toTimeout) {
    data.err = 'Please provide a user to timeout.';
    return data;
  }
  if (data.toTimeout === msg.member) {
    data.err = 'You cannot timeout yourself.';
    return data;
  }
  if (
    data.toTimeout.roles.cache.some(
      (role) =>
        role.name === 'Moderator' ||
        role.name === 'Admin' ||
        role.name === 'Super Admin'
    )
  ) {
    data.err = 'You cannot timeout a moderator or admin.';
    return data;
  }
  if (
    data.toTimeout.communicationDisabledUntilTimestamp !== null &&
    data.toTimeout.communicationDisabledUntil > Date.now()
  ) {
    data.err = 'This user is already timed out.';
    return data;
  }

  // Check if duration is valid.
  data.duration = args[1];
  if (!data.duration) {
    data.err = 'Please provide a duration.';
    return data;
  }
  if (!data.duration.match(/^\d+.?\d*[smhdw]$/)) {
    data.err =
      'Please provide a valid duration. Format should be `<number><s|m|h|d|w>`.';
    return data;
  }
  if (ms(data.duration) > ms('28d')) {
    data.err = 'Please enter a duration less than 28 days.';
    return data;
  }

  // Check if reason is valid.
  data.reason = args.slice(2).join(' ');
  if (data.reason === '') {
    data.err = 'Please provide a reason for the timeout.';
    return data;
  }

  // Return valid data.
  data.status = true;
  return data;
}

// Puts a user in timeout.
function timeoutUser(msg, toTimeout, duration, reason) {
  const durationInMs = ms(duration);
  toTimeout.timeout(durationInMs, reason);

  msg.reply(`${toTimeout} has been timed out for ${duration}.`);
}

// Sends message to #audit-logs.
function auditLogTimeout(msg, toTimeout, duration, reason) {
  const auditLogEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${toTimeout.user.username}#${toTimeout.user.discriminator} was timed out by ${msg.author.tag} for ${duration}.`
    )
    .addField('Reason', reason)
    .setTimestamp()
    .setFooter({text: `${msg.guild.name}`})
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${toTimeout.user.id}/${toTimeout.user.avatar}.png`
    );

  msg.guild.channels.cache
    .find((channel) => channel.name === 'audit-logs')
    .send({embeds: [auditLogEmbed]});
}

// Records timeout in infractions and mod_log tables.
function recordTimeoutInDB(msg, toTimeout, duration, reason, con) {
  const now = new Date();
  const timestamp = dateformat(now, 'yyyy-mm-dd HH:MM:ss');

  const sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES (?, ?, 'timeout', ?, ?, true, ?);
  INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason)
  VALUES (?, ?, ?, ?, ?);`;

  const values = [
    timestamp,
    toTimeout.id,
    duration,
    reason,
    msg.author.id,
    timestamp,
    msg.author.id,
    msg.content,
    duration,
    reason,
  ];
  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
      msg.channel.send({
        content: `I timed out ${toTimeout} but writing to the db failed!`,
      });
    } else {
      console.log(
        '1 record inserted into infractions, 1 record inserted into mod_log.'
      );
    }
  });
}

// Attempts to DM the user with the reason for the timeout.
async function dmTheUser(msg, toTimeout, duration, reason) {
  const verbalEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`You have been timed out for ${ms(ms(duration), {long: true})}.`)
    .addField('Reason', reason)
    .setTimestamp()
    .setFooter({text: `${msg.guild.name}`})
    .setThumbnail(msg.guild.iconURL({dynamic: true}));

  await toTimeout.user.send({embeds: [verbalEmbed]});
}
