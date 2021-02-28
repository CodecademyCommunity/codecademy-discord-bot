const Discord = require('discord.js');
const dateFormat = require('dateformat');

module.exports = {
  name: 'ban',
  description: 'Ban a user',

  execute(msg, con, args) {
    const {status, err, toBan, reason} = validBan(msg);
    if (!status) {
      return msg.reply(err);
    }

    banUser(msg, toBan, reason);
    banSQL(msg, toBan, reason, args, con);
    banEmbed(msg, toBan, reason);
  },
};

function validBan(msg) {
  const data = {
    status: false,
    err: null,
    toBan: null,
    reason: null,
  };

  if (!msg.member.roles.cache.some((role) => role.name === 'Admin')) {
    data.err = msg.reply('You must be an Admin to use this command.');
    return data;
  }

  data.toBan = msg.mentions.members.first();
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

  data.reason = msg.content.substr(msg.content.indexOf('>') + 2);
  if (data.reason === '') {
    data.err = 'Please provide a reason for banning.';
    return data;
  }

  data.status = true;
  return data;
}

function banSQL(msg, toBan, reason, args, con) {
  const now = new Date();
  const date = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const action = 'cc!ban ' + args.join(' ');

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
    action,
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

function banUser(msg, toBan, reason) {
  // Banning member and sending him a DM with a form to refute the ban and the reason
  toBan.send(
    "You've been banned for the following reason: ```" +
      reason +
      ' ``` If you wish to challenge this ban, please submit a response in this Google Form: https://docs.google.com/forms/d/e/1FAIpQLSc1sx6iE3TYgq_c4sALd0YTkL0IPcnkBXtR20swahPbREZpTA/viewform'
  );
  toBan.ban({reason});

  msg.reply(`${toBan} was banned.`);
}
