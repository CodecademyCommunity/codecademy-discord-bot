const Discord = require('discord.js');
const dateFormat = require('dateformat');
const {verifyReasonLength} = require('../../helpers/stringHelpers');

module.exports = {
  name: 'kick',
  description: 'Kick a user',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Moderator',
  kickIntro: "You've been kicked for the following reason: ```",
  kickOutro: ' ```',

  async execute(msg, args, con) {
    const {status, err, toKick, reason} = validKick(msg, args);
    if (!status) {
      return msg.reply(err);
    }

    const kickText = this.kickIntro + reason + this.kickOutro;
    if (!verifyReasonLength(msg.content, msg)) return;

    try {
      await kickUser(msg, toKick, kickText);
    } catch (error) {
      return msg.reply(`${error.name}: ${error.message}`);
    }

    kickSQL(msg, toKick, reason, con);
    kickEmbed(msg, toKick, reason);
  },
};

function validKick(msg, args) {
  const data = {
    status: false,
    err: null,
    toKick: null,
    reason: null,
  };

  // Grabs the user and makes sure that one was provided
  data.toKick =
    msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
  if (!data.toKick) {
    data.err = 'Please provide a user to kick.';
    return data;
  }

  // Prevents you from kicking yourself
  if (data.toKick.id == msg.author.id) {
    data.err = "You can't kick yourself!";
    return data;
  }

  // Checks that the person who is getting kicked doesn't have kick privileges
  if (data.toKick.permissions.has('KICK_MEMBERS')) {
    data.err = 'This user also has kick privileges.';
    return data;
  }

  // Checks that a reason was included
  data.reason = args.slice(1).join(' ');
  if (data.reason === '') {
    data.err = 'Please provide a reason for kicking.';
    return data;
  }

  data.status = true;
  return data;
}

function kickSQL(msg, toKick, reason, con) {
  const now = new Date();
  const date = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  // Inserts row into database
  const sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES 
    (?, ?, 'cc!kick', NULL, ?, true, ?);
    INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
    (?, ?, ?, NULL, ?)`;
  const values = [
    date,
    toKick.id,
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

function kickEmbed(msg, toKick, reason) {
  // Sends Audit Log Embed
  const channel = msg.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const kickEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${toKick.user.username}#${toKick.user.discriminator} was kicked by ${msg.author.tag}:`
    )
    .setDescription(reason)
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${toKick.user.id}/${toKick.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter({text: `${msg.guild.name}`});

  channel.send({embeds: [kickEmbed]});
}

async function kickUser(msg, toKick, reason) {
  // Actual Kick
  try {
    await toKick.send(reason);
    await msg.reply(`Message sent to ${toKick} successfully`);
    await toKick.kick({reason});
  } catch (error) {
    console.error(error);
    throw error;
  }

  msg.reply(`${toKick} was kicked.`);
}
