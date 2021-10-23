const Discord = require('discord.js');
const dateFormat = require('dateformat');
const {hasTargetUser} = require('../../helpers/hasTargetUser');

module.exports = {
  name: 'removenote',
  description: 'Removes a specific note based on the note ID provided',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Moderator',

  execute(msg, args, con) {
    const targetUser =
      msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
    if (hasTargetUser(msg, targetUser, 'remove a note from')) {
      const {status, err, userNote, noteID} = validNote(msg, args);
      if (!status) {
        msg.reply(err);
      } else {
        validatenoteID(msg, userNote, args, noteID, con);
      }
    }
  },
};

function validNote(msg, args) {
  const data = {
    status: false,
    err: null,
    userNote: null,
    noteID: null,
  };

  data.userNote =
    msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

  if (data.userNote === msg.member) {
    data.err = 'You cannot remove a note from yourself.';
    return data;
  }

  console.log(args);
  data.noteID = args[1];
  if (!data.noteID) {
    data.err = 'Please provide a note ID to remove.';
    return data;
  }

  data.status = true;
  return data;
}

function validatenoteID(msg, userNote, args, noteID, con) {
  const sql = `SELECT user, valid FROM user_notes WHERE id = ?;`;

  const values = [noteID];

  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result[0].user !== userNote.id) {
        msg.reply('The specified note does not belong to the user.');
      } else if (result[0] && result[0].valid == 0) {
        msg.reply('This note has already been removed.');
      } else if (result[0] && result[0].valid == 1) {
        noteSQL(msg, userNote, noteID, args, con);
      } else {
        msg.reply('Please include a valid note ID.');
      }
    }
  });
}

function noteSQL(msg, userNote, noteID, args, con) {
  const now = new Date();
  const date = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const action = 'cc!removenote ' + args.join(' ');

  // Inserts row into database
  const sql = `UPDATE user_notes SET valid = ? WHERE id = ?;
    INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
    (?, ?, ?, NULL, NULL);`;

  const values = [false, noteID, date, msg.author.id, action];
  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('Note was set to invalid.');
      noteResponse(msg, userNote, noteID);
      noteEmbed(msg, userNote, noteID);
    }
  });
}

function noteEmbed(msg, userNote, noteID) {
  // Sends Audit Log Embed
  const channel = msg.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const userNoteEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${msg.author.tag} removed an note from ${userNote.user.username}#${userNote.user.discriminator}`
    )
    .setDescription('Note #' + noteID)
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${userNote.user.id}/${userNote.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter(`${msg.guild.name}`);

  channel.send(userNoteEmbed);
}

function noteResponse(msg, userNote, noteID) {
  msg.reply(`Note #${noteID} was removed from ${userNote}.`);
}
