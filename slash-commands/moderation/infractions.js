const {SlashCommandBuilder} = require('@discordjs/builders');
const {infractionsPresenter} = require('../../presenters/dataPresenters');
const {displayRecordsLog} = require('../../presenters/logPresenters');
const {promisePool} = require('../../config/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infractions')
    .setDescription(
      'Finds user infractions records in db and returns it to channel'
    )
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The user (mention or id)')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const targetUser = await interaction.options.getUser('target');
      const infractions = await getInfractionsFromDB(targetUser);
      await displayRecordsLog({
        interaction: interaction,
        targetUser: targetUser,
        recordCollections: [infractionsPresenter(infractions)],
      });
    } catch (err) {
      console.error(err);
      interaction.reply(`There was an error reading the infractions.`);
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
