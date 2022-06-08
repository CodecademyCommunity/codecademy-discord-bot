const Discord = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {formatDistanceToNow} = require('date-fns');
const {getEmbedHexFlairColor} = require('../../helpers/design');
const {promisePool} = require('../../config/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('notes')
    .setDescription('Finds user notes record in db and returns it to channel')
    .addUserOption((option) =>
      option.setName('target').setDescription('The user').setRequired(true)
    ),

  async execute(interaction) {
    try {
      const targetUser = await interaction.options.getUser('target');
      const notes = await getNotesFromDB(targetUser);
      await displayNotesLog(interaction, targetUser, notes);
    } catch (err) {
      console.error(err);
      interaction.reply(`There was an error reading the notes.`);
    }
  },
};

async function getNotesFromDB(targetUser) {
  try {
    const sqlNotes = `SELECT timestamp,moderator,id,note,valid FROM user_notes WHERE user = ?`;
    const [notes] = await promisePool.execute(`${sqlNotes}`, [targetUser.id]);
    return notes;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function displayNotesLog(interaction, targetUser, notes) {
  const listOfNotes = parseNotes(interaction, notes);
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
      .setFooter({text: interaction.guild.name});

    return await interaction.reply({embeds: [notesEmbed]});
  } else {
    return await interaction.reply(
      `${targetUser.username}#${targetUser.discriminator} doesn't have any notes`
    );
  }
}

function parseNotes(interaction, notes) {
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
