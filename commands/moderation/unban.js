const Discord = require('discord.js');
const dateFormat = require('dateformat');

module.exports = {
  name: 'unban',
  description: 'Unban a user',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Moderator',

  async execute(msg, args, con) {
    const {status, err, toUnban} = await validUnban(msg, args);
    if (!status) {
      return msg.reply({content: err});
    }

    const channel = msg.guild.channels.cache.find(
      (channel) => channel.name === 'audit-logs'
    );

    unbanSQL(msg, con, args);
    unbanEmbed(msg, toUnban, channel);
    unbanUser(msg, toUnban);
  },
};

async function validUnban(msg, args) {
  const data = {
    status: false,
    err: null,
    toUnban: null,
  };

  const userMention = msg.mentions.members.first();
  if (userMention) {
    data.err =
      "You can't ban users by mentioning them, please include a user ID";
    return data;
  }

  data.toUnban = args[0];
  if (!data.toUnban) {
    data.err = 'Please include a user ID to unban.';
    return data;
  }

  const fetchUser = msg.client.users.fetch(data.toUnban);

  const userID = await fetchUser.then((result) => result.id);
  if (userID == msg.author.id) {
    data.err = "You can't unban yourself!";
    return data;
  }

  data.status = true;
  return data;
}

function unbanSQL(msg, con, args) {
  const action = 'cc!unban ' + args.join(' ');
  const now = new Date();
  const date = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');
  // Inserts row into database
  const sql = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
                (?, ?, ?, NULL, NULL)`;
  const values = [date, msg.author.id, action];
  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('1 record inserted');
    }
  });
}

function unbanEmbed(msg, toUnban, channel) {
  // Sends Audit Log Embed

  const unbanEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${toUnban} was unbanned by ${msg.author.tag}:`)
    .setTimestamp()
    .setFooter({text: `${msg.guild.name}`});

  channel.send({embeds: [unbanEmbed]});
}

async function unbanUser(msg, toUnban) {
  try {
    await msg.guild.members.unban(toUnban);
  } catch (error) {
    if (error.code == 10026) {
      return msg.reply({content: 'This user is not banned.'});
    }

    if (error.code == 50035) {
      return msg.reply({content: 'Please include a valid user ID'});
    }
  }
  msg.reply({content: `${toUnban} was unbanned.`});
}
