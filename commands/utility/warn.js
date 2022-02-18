const Discord = require('discord.js');
const dateFormat = require('dateformat');
const {verifyReasonLength} = require('../../helpers/stringHelpers');
const {hasTargetUser} = require('../../helpers/hasTargetUser');

module.exports = {
  name: 'warn',
  description: 'warns a user of an infraction and logs infraction in db',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Moderator',
  execute(msg, args, con) {
    // Make sure only SU, Mods and Admin can run the command
    const offendingUser =
      msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

    if (
      hasTargetUser(msg, offendingUser, 'warn') &&
      notSelf(msg, offendingUser) &&
      notHighRoller(msg, offendingUser)
    ) {
      // Parse the reason for the warning
      // if no reason provided, return so the bot doesn't go boom
      const warningReason = args.slice(1).join(' ');
      if (!warningReason) return msg.reply('You need to provide a reason');

      if (!verifyReasonLength(msg.content, msg)) return;

      // Create an embed, craft it, and DM the user
      dmTheUser(msg, offendingUser, warningReason);

      // Register call in the Audit-log channel
      auditLog(msg, offendingUser, warningReason);

      // Give SU, Mod, Admin feedback on their call
      msg.channel.send({content: `${msg.author} just warned ${offendingUser}`});

      // Add the infraction to the database
      recordInDB(msg, con, offendingUser, warningReason);
    }
  },
};

function auditLog(message, targetUser, reason) {
  // Outputs a message to the audit-logs channel.
  const channel = message.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const warnEmbed = new Discord.MessageEmbed()
    .setColor('#f1d302')
    .setTitle(
      `${targetUser.user.username}#${targetUser.user.discriminator} was warned by ${message.author.tag}:`
    )
    .setDescription(reason)
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${targetUser.user.id}/${targetUser.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter(`${message.guild.name}`);

  channel.send({embeds: [warnEmbed]});
}

function dmTheUser(msg, targetUser, reason) {
  // Create an embed, craft it, and DM the user
  const Embed = new Discord.MessageEmbed()
    .setColor('#f1d302')
    .setTitle(`Warning to ${targetUser.user.username}`)
    .setDescription(reason)
    .setTimestamp()
    .setFooter(`${msg.guild.name}`);
  targetUser.send({embeds: [Embed]});
}

function recordInDB(msg, con, offendingUser, warningReason) {
  // Add the infraction to the database
  const now = new Date();
  const timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator)
    VALUES (?, ?, 'cc!warn', NULL, ?, true, ?);
    INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason)
    VALUES (?, ?, ?, NULL, ?);`;

  const values = [
    timestamp,
    offendingUser.id,
    warningReason,
    msg.author.id,
    timestamp,
    msg.author.id,
    msg.content,
    warningReason,
  ];
  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
      // Include a warning in case something goes wrong writing to the db
      msg.channel.send({
        content: `I warned ${offendingUser} but writing to the db failed!`,
      });
    } else {
      console.log(
        '1 record inserted into infractions, 1 record inserted into mod_log.'
      );
    }
  });
}

function notHighRoller(msg, offendingUser) {
  if (
    offendingUser.roles.cache.some(
      (role) =>
        role.name === 'Forums Super User' ||
        role.name === 'Code Counselor' ||
        role.name === 'Moderator' ||
        role.name === 'Admin' ||
        role.name === 'Super Admin'
    )
  ) {
    msg.reply('You cannot warn a Code Counselor, Moderator or Admin.');
    return false;
  } else {
    return true;
  }
}

function notSelf(msg, offendingUser) {
  if (offendingUser.id == msg.author.id) {
    msg.reply({content: 'Did you just try to warn yourself?'});
    return false;
  } else {
    return true;
  }
}
