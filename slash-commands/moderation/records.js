const {SlashCommandBuilder} = require('@discordjs/builders');
const {notesPresenter} = require('../../presenters/dataPresenters');
const {infractionsPresenter} = require('../../presenters/dataPresenters');
const {displayRecordsLog} = require('../../presenters/logPresenters');
const {promisePool} = require('../../config/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('records')
    .setDescription('Finds all user records in db and returns them to channel')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The user (mention or id)')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const targetUser = await interaction.options.getUser('target');
      const notes = await getNotesFromDB(targetUser);
      const infractions = await getInfractionsFromDB(targetUser);
      await displayRecordsLog({
        interaction: interaction,
        targetUser: targetUser,
        recordCollections: [
          infractionsPresenter(infractions),
          notesPresenter(interaction, notes),
        ],
      });
    } catch (err) {
      console.error(err);
      interaction.reply(`There was an error reading the records.`);
    }
  },
};

async function getInfractionsFromDB(targetUser) {
  try {
    const sqlInfractions = `SELECT timestamp,reason,id,action,valid FROM infractions WHERE user = ?`;
    const [infractions] = await promisePool.execute(sqlInfractions, [
      targetUser.id,
    ]);
    return infractions;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function getNotesFromDB(targetUser) {
  try {
    const sqlNotes = `SELECT timestamp,moderator,id,note,valid FROM user_notes WHERE user = ?`;
    const [notes] = await promisePool.execute(`${sqlNotes}`, [targetUser.id]);
    return notes;
  } catch (err) {
    throw new Error(err.message);
  }
}
