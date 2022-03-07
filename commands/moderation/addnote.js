const Discord = require('discord.js');
const dateFormat = require('dateformat');
const {hasTargetUser} = require('../../helpers/hasTargetUser');

module.exports = {
  name: 'addnote',
  description: 'write a user note and store in the db',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Code Counselor',
  execute(msg, args, con) {
    // Make sure only SU, Mods and Admin can run the command
    const targetUser =
      msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

    if (
      hasTargetUser(msg, targetUser, 'add a note to') &&
      notSelf(msg, targetUser) &&
      notHighRoller(msg, targetUser)
    ) {
      // grab the note
      const note = args.slice(1).join(' ');
      if (!note) return msg.reply(`You forgot to write the note.`);
      if (note.length > 255)
        return msg.reply(`Too long! Notes can only be 255 characters or less.`);

      // Feedback back to the command caller
      postEmbed(msg, targetUser, note);

      // write it to the db
      addNoteToDB(msg, con, targetUser, note);
    }
  },
};

function postEmbed(msg, targetUser, note) {
  const embedFlair = [
    '#f8f272',
    '#f98948',
    '#a23e48',
    '#6096ba',
    '#86a873',
    '#d3b99f',
    '#6e6a6f',
  ];

  const embed = new Discord.MessageEmbed()
    .setAuthor({
      name: `${targetUser.user.username}#${targetUser.user.discriminator}`,
      iconURL: `https://cdn.discordapp.com/avatars/${targetUser.user.id}/${targetUser.user.avatar}.png`,
    })
    .setTitle(`New note`)
    .setColor(embedFlair[Math.floor(Math.random() * embedFlair.length)])
    .addField(`Note:`, `${note}`)
    .setTimestamp()
    .setFooter({text: `${msg.guild.name}`});

  msg.channel.send({embeds: [embed]});
}

function addNoteToDB(msg, con, targetUser, note) {
  const now = new Date();
  const timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const sql = `INSERT INTO user_notes (timestamp, user, moderator, note)
    VALUES (?, ?, ?, ?);`;

  const values = [timestamp, targetUser.id, msg.author.id, note];
  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
      // Include a warning in case something goes wrong writing to the db
      msg.channel.send(`Writing to the db failed!`);
    } else {
      console.log(`1 note added to table: user_notes`);
    }
  });
}

function notHighRoller(msg, targetUser) {
  if (
    targetUser.roles.cache.some(
      (role) =>
        role.name === 'Forums Super User' ||
        role.name === 'Code Counselor' ||
        role.name === 'Moderator' ||
        role.name === 'Admin' ||
        role.name === 'Super Admin'
    )
  ) {
    msg.reply(
      `You cannot write a note about a Code Counselor, Moderator or Admin.`
    );
    return false;
  } else {
    return true;
  }
}

function notSelf(msg, targetUser) {
  if (targetUser.id == msg.author.id) {
    msg.reply(`You can't write notes to yourself!`);
    return false;
  } else {
    return true;
  }
}
