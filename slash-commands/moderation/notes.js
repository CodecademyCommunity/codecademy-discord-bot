const Discord = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {getConnection} = require('../../config/db');
const {formatDistanceToNow} = require('date-fns');
const {getEmbedHexFlairColor} = require('../../helpers/design');

const con = getConnection();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('notes')
    .setDefaultPermission(false)
    .setDescription('Finds user notes record in db and returns it to channel')
    .addUserOption((option) =>
      option.setName('target').setDescription('The user').setRequired(true)
    ),

  async execute(interaction) {
    const targetUser = await interaction.options.getUser('target');
    notesInDB(interaction, con, targetUser);
  },
};

function notesInDB(interaction, con, targetUser) {
  // Find notes in table user_notes
  const sqlNotes = `SELECT timestamp,moderator,id,note,valid FROM user_notes WHERE user = '${targetUser.id}';`;

  con.query(`${sqlNotes}`, function (err, result) {
    if (err) {
      console.log(err);
      // Include a warning in case something goes wrong writing to the db
      interaction.channel.send(
        `I couldn't read ${targetUser}'s notes from the db!`
      );
    } else {
      console.log('Found note records.');
      notesLog(interaction, targetUser, result);
    }
  });
}

function notesLog(interaction, targetUser, notes) {
  const listOfNotes = parseNotes(interaction, notes);

  // Get properties from the list
  const totalNotes = listOfNotes.length;

  if (totalNotes) {
    const notesEmbed = new Discord.MessageEmbed()
      .setAuthor({
        name: `${targetUser.username}#${targetUser.discriminator}'s notes`,
        iconURL: `https://cdn.discordapp.com/avatars/${targetUser.id}/${targetUser.avatar}.png`,
      })
      .setColor(getEmbedHexFlairColor())
      .setDescription(`Total: ${totalNotes}`)
      .addFields(...listOfNotes)
      .setTimestamp()
      .setFooter({text: `${interaction.guild.name}`});

    interaction.channel.send({embeds: [notesEmbed]});
  } else {
    interaction.reply(
      `${targetUser.username}#${targetUser.discriminator} doesn't have any notes`
    );
  }
}

function parseNotes(interaction, notes) {
  // parse notes into an array
  return notes.reduce((validNotes, currentNote) => {
    if (currentNote.valid) {
      validNotes.push({
        name: `ID: ${currentNote.id}   ${formatDistanceToNow(
          currentNote.timestamp
        )} ago`,
        value: `${interaction.guild.members.cache.get(
          currentNote.moderator
        )}: ${currentNote.note}`,
      });
    }
    return validNotes;
  }, []);
}
