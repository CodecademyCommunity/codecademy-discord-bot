const Discord = require('discord.js');
const ms = require('ms');
const dateFormat = require('dateformat');
const {verifyReasonLength} = require('../../helpers/stringHelpers');

module.exports = {
  name: 'tempban',
  description: 'Temporarily ban a user',
  guildOnly: true,
  banIntro: "You've been banned for the following reason: ```",
  unbanRequest:
    ' ``` If you wish to challenge this ban, please submit a response in this Google Form: https://forms.gle/KxTMhPbi866r2FEz5',

  async execute(msg, args, con) {
    const {status, err, toTempBan, reason, timeLength} = validTempBan(
      msg,
      args
    );
    if (!status) {
      return msg.reply(err);
    }

    const banText = this.banIntro + reason + this.unbanRequest;
    verifyReasonLength(banText, msg);

    const channel = msg.guild.channels.cache.find(
      (channel) => channel.name === 'audit-logs'
    );

    tempSQL(msg, toTempBan, timeLength, reason, con, args);
    tempEmbed(msg, toTempBan, reason, channel, timeLength);

    try {
      await tempBanUser(msg, toTempBan, banText, timeLength);
    } catch (error) {
      return msg.reply(`${error.name}: ${error.message}`);
    }

    await tempBan(msg, toTempBan, con, channel, timeLength);
  },
};

function validTempBan(msg, args) {
  const data = {
    status: false,
    err: null,
    toKick: null,
    userID: null,
    reason: null,
    timeLength: null,
  };

  if (
    !msg.member.roles.cache.some(
      (role) => role.name === 'Admin' || role.name === 'Moderator'
    )
  ) {
    data.err = 'You must be an Admin to use this command.';
    return data;
  }

  const userInformation = /((<@!?)?\d{17,}>?)\s(\d+[yhwdms])\s(.+)$/;

  if (!args.join(' ').match(userInformation)) {
    data.err = "The command you sent isn't in a valid format";
    return data;
  }

  let reasonArray = null;
  [data.userID, data.timeLength, ...reasonArray] = args;
  data.reason = reasonArray.join(' ');

  data.toTempBan =
    msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
  if (!data.toTempBan) {
    data.err = 'Please provide a user to temporarily ban.';
    return data;
  }

  if (data.toTempBan.id == msg.author.id) {
    data.err = "You can't temporarily ban yourself!";
    return data;
  }

  if (data.toTempBan.hasPermission('BAN_MEMBERS')) {
    data.err = 'This user also has ban privileges.';
    return data;
  }

  if (data.reason === '') {
    data.err = 'Please provide a reason for temporarily banning this user.';
    return data;
  }

  data.status = true;
  return data;
}

function tempSQL(msg, toTempBan, timeLength, reason, con, args) {
  const now = new Date();
  const date = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');
  const action = 'cc!tempban ' + args.join(' ');

  // Inserts row into database
  const sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES
    ('${date}', '${toTempBan.id}', 'cc!tempban', '${timeLength}', '${reason}', true, '${msg.author.id}');
    INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
    ('${date}', '${msg.author.id}', '${action}', '${timeLength}', '${reason}');`;

  const values = [
    date,
    toTempBan.id,
    timeLength,
    reason,
    msg.author.id,
    date,
    msg.author.id,
    action,
    timeLength,
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

function tempEmbed(msg, toTempBan, reason, channel, timeLength) {
  // Sends Audit Log Embed
  const tempBanEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${toTempBan.user.username}#${toTempBan.user.discriminator} was banned by ${msg.author.tag} for ${timeLength}:`
    )
    .setDescription(reason)
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${toTempBan.user.id}/${toTempBan.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter(`${msg.guild.name}`);

  channel.send(tempBanEmbed);
}

async function tempBanUser(msg, toTempBan, reason, timeLength) {
  // Banning member and sending him a DM with a form to refute the ban and the reason
  try {
    await toTempBan.send(reason);
    await msg.reply(`Message sent to ${toTempBan} successfully`);
    await toTempBan.ban({reason});
  } catch (error) {
    console.error(error);
    throw error;
  }

  msg.reply(`${toTempBan} was banned for ${timeLength}.`);
}

async function tempBan(msg, toTempBan, con, channel, timeLength) {
  const tempUnBanEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${toTempBan.user.username}#${toTempBan.user.discriminator} was unbanned after ${timeLength}:`
    )
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${toTempBan.user.id}/${toTempBan.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter(`${msg.guild.name}`);

  setTimeout(async () => {
    try {
      await msg.guild.members.unban(toTempBan);
      await channel.send(tempUnBanEmbed);

      await toTempBan.send(
        `You have been unbanned from the Codecademy Community after ${timeLength}`
      );
    } catch (error) {
      console.error(error);
      msg.reply(`${error.name}: ${error.message}`);
    }

    const now = new Date();
    const date = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

    const modLogTempban = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) 
        VALUES ('${date}', 'automatic', 'cc!unban', NULL, 'tempban expired')`;

    con.query(modLogTempban, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('1 record inserted into mod_log.');
      }
    });
  }, ms(timeLength));
}
