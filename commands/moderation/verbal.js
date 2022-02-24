const Discord = require('discord.js');
const dateFormat = require('dateformat');
const {verifyReasonLength} = require('../../helpers/stringHelpers');
const {hasTargetUser} = require('../../helpers/hasTargetUser');

module.exports = {
  name: 'verbal',
  description: 'sends a user a verbal warning and logs note in db',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Moderator',
  async execute(msg, args, con) {
    // Make sure only Mods and Admins can run the command
    const offendingUser =
      msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

    if (
      hasTargetUser(msg, offendingUser, 'verbal') &&
      notSelf(msg, offendingUser) &&
      notHighRoller(msg, offendingUser)
    ) {
      // Parse the reason for the warning
      // if no reason provided, return so the bot doesn't go boom
      const verbalReason = args.slice(1).join(' ');
      if (!verbalReason) return msg.reply('You need to provide a reason');

      if (!verifyReasonLength(msg.content, msg)) return;

      // Create an embed, craft it, and DM the user
      try {
        await dmTheUser(msg, offendingUser, verbalReason);
      } catch (e) {
        return msg.reply(`${e.name}: ${e.message}`);
      }

      // Register call in the audit-log channel
      auditLog(msg, offendingUser, verbalReason);

      // Give Mod or Admin feedback on their call
      msg.channel.send({
        content: `${msg.author} just verballed ${offendingUser}`,
      });

      // Add the infraction to the database
      recordInDB(msg, con, offendingUser, verbalReason);
    }
  },
};

function auditLog(message, targetUser, reason) {
  // Outputs a message to the audit-logs channel.
  const channel = message.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const verbalEmbed = new Discord.MessageEmbed()
    .setColor('#f1d302')
    .setTitle(
      `${targetUser.user.username}#${targetUser.user.discriminator} was verballed by ${message.author.tag}:`
    )
    .setDescription(reason)
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${targetUser.user.id}/${targetUser.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter({text: `${message.guild.name}`});

  channel.send({embeds: [verbalEmbed]});
}

async function dmTheUser(msg, targetUser, reason) {
  // Create an embed, craft it, and DM the user
  const dmEmbed = new Discord.MessageEmbed()
    .setColor('#f1d302')
    .setTitle(`Verbal to ${targetUser.user.username}`)
    .addField(
      'This verbal is not an official warning.',
      '*However, please engage with the server constructively and review the rules if necessary.*'
    )
    .setDescription(reason)
    .setTimestamp()
    .setFooter({text: `${msg.guild.name}`});
  await targetUser.send({embeds: [dmEmbed]});
}

function recordInDB(msg, con, offendingUser, verbalReason) {
  // Add the infraction to the database
  const now = new Date();
  const timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const sql = `INSERT INTO user_notes (timestamp, user, moderator, note, valid)
    VALUES (?, ?, ?, ?, true);
    INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason)
    VALUES (?, ?, ?, NULL, ?);`;

  const values = [
    timestamp,
    offendingUser.id,
    msg.author.id,
    `Verbal: ${verbalReason}`,
    timestamp,
    msg.author.id,
    msg.content,
    verbalReason,
  ];
  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
      // Include a warning in case something goes wrong writing to the db
      msg.channel.send({
        content: `I verballed ${offendingUser} but writing to the db failed!`,
      });
    } else {
      console.log(
        '1 record inserted into user_notes, 1 record inserted into mod_log.'
      );
    }
  });
}

function notHighRoller(msg, offendingUser) {
  if (
    offendingUser.roles.cache.some(
      (role) =>
        role.name === 'Code Counselor' ||
        role.name === 'Moderator' ||
        role.name === 'Admin' ||
        role.name === 'Super Admin'
    )
  ) {
    msg.reply({
      content: 'You cannot verbal a Code Counselor, Moderator or Admin.',
    });
    return false;
  } else {
    return true;
  }
}

function notSelf(msg, offendingUser) {
  if (offendingUser.id == msg.author.id) {
    msg.reply({content: 'Did you just try to verbal yourself?'});
    return false;
  } else {
    return true;
  }
}
