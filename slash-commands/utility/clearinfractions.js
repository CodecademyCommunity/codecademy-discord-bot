const {SlashCommandBuilder} = require('@discordjs/builders');
const {sendToAuditLogsChannel} = require('../../helpers/sendToAuditLogs');
const {promisePool} = require('../../config/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearinfractions')
    .setDescription('Removes all infractions from a user')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user').setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = await interaction.options.getUser('user');
    try {
      const hasInfractions = await checkForInfractions(targetUser.id);
      if (!hasInfractions) {
        return interaction.reply('This user does not have any infractions.');
      }
      await deactivateInfractionsDB(interaction, targetUser.id);
      await sendToAuditLogsChannel(interaction, {
        color: '#0099ff',
        titleMsg: `${interaction.user.tag} cleared all infractions for ${targetUser.username}#${targetUser.discriminator}`,
        targetUser,
      });
      await clearInfractionsResponse(interaction, targetUser);
    } catch (err) {
      console.error(err);
      interaction.reply(`There was a problem clearing the infractions.`);
    }
  },
};

async function checkForInfractions(userId) {
    const sql = `SELECT * FROM infractions WHERE user = ? AND valid = true`;
    const values = [userId];
    try {
      const [infractions] = await promisePool.execute(sql, values);
      return (infractions.length) ? true : false;
    } catch (err) {
      throw new Error(err.message);
    }
  }

async function deactivateInfractionsDB(interaction, targetUser) {
  try {
    const invalidateSQL = `UPDATE infractions SET valid = ? WHERE user = ?`;
    const invalidateValues = [false, targetUser];
    await promisePool.execute(invalidateSQL, invalidateValues);

    const modlogSQL = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
    (now(), ?, ?, NULL, NULL);`;
    const action = `clearinfractions ${targetUser.id}`;
    const modlogValues = [interaction.user.id, action];
    await promisePool.execute(modlogSQL, modlogValues);
  } catch (err) {
    throw new Error(err.message);
  }
}

async function clearInfractionsResponse(interaction, targetUser) {
  await interaction.reply(
    `All infractions were removed from ${targetUser.username}.`
  );
}