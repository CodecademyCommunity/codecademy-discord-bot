const Discord = require('discord.js');
const {hasTargetUser} = require('../../helpers/hasTargetUser');

module.exports = {
  name: 'notes',
  description: 'finds user notes record in db and returns it to channel',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Code Counselor',
  execute(msg, args, con) {
    // Make sure only SU, Mods and Admin can run the command
    const targetUser =
      msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

    if (hasTargetUser(msg, targetUser, 'read notes from')) {
      // Find all notes records in database
      // Because of async, call notesLog from notesInDB
      notesInDB(msg, con, targetUser);
    }
  },
  notesInDB: notesInDB,
};

function notesInDB(msg, con, targetUser) {
  // Find notes in table user_notes
  const sqlNotes = `SELECT timestamp,moderator,id,note,valid FROM user_notes WHERE user = '${targetUser.id}';`;

  con.query(`${sqlNotes}`, function (err, result) {
    if (err) {
      console.log(err);
      // Include a warning in case something goes wrong writing to the db
      msg.channel.send(`I couldn't read ${targetUser}'s notes from the db!`);
    } else {
      console.log('Found note records.');
      notesLog(msg, targetUser, result);
    }
  });
}

function notesLog(msg, targetUser, notes) {
  const listOfNotes = parseNotes(msg, notes);

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

function parseNotes(msg, notes) {
  // parse notes into an array
  const allNotes = notes.map((note) => [
    note.timestamp,
    note.moderator,
    note.id,
    note.note,
    note.valid,
  ]);
  const timestampList = allNotes.map((note) => note[0]);
  const moderatorList = allNotes.map((note) => note[1]);
  const idList = allNotes.map((note) => note[2]);
  const noteList = allNotes.map((note) => note[3]);
  const validList = allNotes.map((note) => note[4]);

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
      timeSinceNote[idx] = [`${Math.floor(days)}d ${Math.round(days % 24)}h`];
    } else if (Math.floor(hours) > 0) {
      timeSinceNote[idx] = [`${Math.floor(hours)}h ${Math.round(hours % 60)}m`];
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
    if (validList[i])
      notesWithTimes.push(
        `**ID: ${idList[i]}** • ${msg.guild.members.cache.get(
          moderatorList[i]
        )}: *${noteList[i]}* • ${timeSinceNote[i]} *ago*`
      );
  }
  return notesWithTimes;
}
