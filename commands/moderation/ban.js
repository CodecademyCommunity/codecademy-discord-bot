const Discord = require('discord.js');
const dateFormat = require('dateformat');
const {verifyReasonLength} = require('../../helpers/stringHelpers');

module.exports = {
  name: 'ban',
  description: 'Ban a user',
  guildOnly: true,
  banIntro: "You've been banned for the following reason: ```",
  unbanRequest:
    ' ``` If you wish to challenge this ban, please submit a response in this Google Form: https://forms.gle/KxTMhPbi866r2FEz5',

  async execute(msg, args, con) {
    const {status, err, toBan, reason} = validBan(msg, args);
    if (!status) {
      return msg.reply(err);
    }

    const banText = this.banIntro + reason + this.unbanRequest;
    if (!verifyReasonLength(msg.content, msg)) return;

    try {
      await banUser(msg, toBan, banText);
    } catch (error) {
      return msg.reply(`${error.name}: ${error.message}`);
    }

    banSQL(msg, toBan, reason, con);
    banEmbed(msg, toBan, reason);
  },
};

function validBan(msg, args) {
  const data = {
    status: false,
    err: null,
    toBan: null,
    reason: null,
  };

  if (
    !msg.member.roles.cache.some(
      (role) => role.name === 'Admin' || role.name === 'Moderator'
    )
  ) {
    data.err = 'You must be an Admin or Moderator to use this command.';
    return data;
  }

  data.toBan =
    msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
  if (!data.toBan) {
    data.err = 'Please provide a user to ban.';
    return data;
  }

  if (data.toBan.id == msg.author.id) {
    data.err = "You can't ban yourself!";
    return data;
  }

  if (data.toBan.hasPermission('BAN_MEMBERS')) {
    data.err = 'This user also has ban privileges.';
    return data;
  }

  data.reason = args.slice(1).join(' ');
  if (data.reason === '') {
    data.err = 'Please provide a reason for banning.';
    return data;
  }

  data.status = true;
  return data;
}

function banSQL(msg, toBan, reason, con) {
  const now = new Date();
  const date = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  // Inserts row into database
  const sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES 
    (?, ?, 'cc!ban', NULL, ?, true, ?);
    INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
    (?, ?, ?, NULL, ?);`;

  const values = [
    date,
    toBan.id,
    reason,
    msg.author.id,
    date,
    msg.author.id,
    msg.content,
    reason,
  ];
  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('1 record inserted');
    }
  });
}

function banEmbed(msg, toBan, reason) {
  // Sends Audit Log Embed
  const channel = msg.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const banEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${toBan.user.username}#${toBan.user.discriminator} was banned by ${msg.author.tag}:`
    )
    .setDescription(reason)
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${toBan.user.id}/${toBan.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter(`${msg.guild.name}`);

  channel.send(banEmbed);
}

async function banUser(msg, toBan, reason) {
  // Banning member and sending him a DM with a form to refute the ban and the reason

  try {
    await toBan.send(reason);
    await msg.reply(`Message sent to ${toBan} successfully`);
    await toBan.ban({reason});
  } catch (error) {
    console.error(error);
    throw error;
  }

  msg.reply(`${toBan} was banned.`);
}
