const {SlashCommandBuilder} = require('@discordjs/builders');
const {notesPresenter} = require('../../presenters/dataPresenters');
const {displayRecordsLog} = require('../../presenters/logPresenters');
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
      await displayRecordsLog({
        interaction: interaction,
        targetUser: targetUser,
        recordCollections: [notesPresenter(interaction, notes)],
      });
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
