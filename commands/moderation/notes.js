const Discord = require('discord.js');

module.exports = {
  name: 'notes',
  description: 'finds user notes record in db and returns it to channel',
  execute(msg, con, args) {
    // Make sure only SU, Mods and Admin can run the command
    const targetUser =
      msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

    if (canCheckNotes(msg)) {
      if (hasUserTarget(msg, targetUser)) {
        // Find all notes records in database
        // Because of async, call notesLog from notesInDB
        notesInDB(msg, con, targetUser);
      }
    }
  },
};

function notesInDB(msg, con, targetUser) {
  // Find notes in table user_notes
  const sqlNotes = `SELECT timestamp,moderator,id,note FROM user_notes WHERE user = '${targetUser.id}';`;

  con.query(`${sqlNotes}`, function (err, result) {
    if (err) {
      console.log(err);
      // Include a warning in case something goes wrong writing to the db
      msg.channel.send(
        `I couldn't read ${targetUser}'s notes from the db!`
      );
    } else {
      console.log('Found note records.');
      notesLog(msg, targetUser, result);
    }
  });
}

function notesLog(msg, targetUser, notes) {
  const listOfNotes = parseNotes(msg,notes);

  // Get properties from the list
  const totalNotes = listOfNotes.length;

  // Set some colors for the embed
  const embedFlair = [
    '#f8f272',
    '#f98948',
    '#a23e48',
    '#6096ba',
    '#86a873',
    '#d3b99f',
    '#6e6a6f',
  ];

  if (totalNotes) {
    const notesEmbed = new Discord.MessageEmbed()
      .setAuthor(
        `${targetUser.user.username}#${targetUser.user.discriminator}'s notes`,
        `https://cdn.discordapp.com/avatars/${targetUser.user.id}/${targetUser.user.avatar}.png`
      )
      .setColor(embedFlair[Math.floor(Math.random() * embedFlair.length)])
      .addField(`Total`, `${totalNotes}`)
      .addField(`Latest Notes: `, listOfNotes)
      .setTimestamp()
      .setFooter(`${msg.guild.name}`);

    msg.channel.send(notesEmbed);
  } else {
    msg.reply(
      `${targetUser.user.username}#${targetUser.user.discriminator} doesn't have any notes`
    );
  }
}

function parseNotes(msg,notes) {
  // parse notes into an array
  const allNotes = notes.map((note) => [
    note.timestamp,
    note.moderator,
    note.id,
    note.note,
  ]);
  const timestampList = allNotes.map((note) => note[0]);
  const moderatorList = allNotes.map((note) => note[1]);
  const idList = allNotes.map((note) => note[2]);
  const noteList = allNotes.map((note) => note[3]);

  // Format timestamps to work backwards from current time
  // First convert to millisecs, then compare with current time
  timestampList.forEach((time, idx) => (timestampList[idx] = Date.parse(time)));
  const now = Date.now();
  const timeSinceNote = timestampList.map((time) => now - time); // elapsed time
  timeSinceNote.forEach((time, idx) => {
    const seconds = time / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    if (Math.floor(days) > 0) {
      timeSinceNote[idx] = [
        `${Math.floor(days)}d ${Math.round(days % 24)}h`,
      ];
    } else if (Math.floor(hours) > 0) {
      timeSinceNote[idx] = [
        `${Math.floor(hours)}h ${Math.round(hours % 60)}m`,
      ];
    } else {
      timeSinceNote[idx] = [
        `${Math.floor(minutes)}m ${Math.round(minutes % 60)}s`,
      ];
    }
  });

  // Join noteList with timeSinceNote
  // This lets us print out the embedded message so much better
  const notesWithTimes = [];
  for (let i = 0; i < moderatorList.length; i++) {
    notesWithTimes.push(
      `**ID: ${idList[i]}** • ${msg.guild.members.cache.get(moderatorList[i])}: _${noteList[i]}_ • ${timeSinceNote[i]} _ago_`
    );
  }
  return notesWithTimes;
}

function canCheckNotes(msg) {
  if (
    !msg.member.roles.cache.some(
      (role) =>
        role.name === 'Super User' ||
        role.name === 'Moderator' ||
        role.name === 'Admin'
    )
  ) {
    msg.reply(
      'You must be a Super User, Moderator or Admin to use this command.'
    );
    return false;
  } else {
    return true;
  }
}

function hasUserTarget(msg, targetUser) {
  // Asortment of answers to make the bot more fun
  const failAttemptReply = [
    'Ok there bud, whose notes are you trying to check again?',
    'You definitely missed the targer user there...',
    'what? You want ALL the notes from everyone? You forgot the targer user',
    "Not judging, but you didn't set a user to read notes from...",
    'You forgot the targer user',
    'Forgot the target user. Wanna try again?',
    'Here I was thinking this command was easy enough. You forgot the target user',
  ];

  if (targetUser) {
    return true;
  } else {
    msg.reply(
      failAttemptReply[Math.floor(Math.random() * failAttemptReply.length)]
    );
    return false;
  }
}
