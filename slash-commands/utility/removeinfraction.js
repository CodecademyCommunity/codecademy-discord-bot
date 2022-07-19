const {SlashCommandBuilder} = require('@discordjs/builders');
const {sendToAuditLogsChannel} = require('../../helpers/sendToAuditLogs');
const {promisePool} = require('../../config/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeinfraction')
    .setDescription('Removes a specific infraction based on the ID provided')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('infraction-id').setDescription('The infraction id').setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = await interaction.options.getUser('user');
    const infractionId = await interaction.options.getInteger('infraction-id');
    try {
      const {isValid, msg} = await validateInfractionId(targetUser.id, infractionId);
      if (!isValid) {
        return interaction.reply(msg);
      }
      await deactivateInfractionDB(interaction, infractionId, targetUser);
      await sendToAuditLogsChannel(interaction, {
        color: '#0099ff',
        titleMsg: `${interaction.user.tag} removed an infraction from ${targetUser.username}#${targetUser.discriminator}`,
        description: `Infraction #${infractionId}`,
        targetUser,
      });
      await removeInfractionResponse(interaction, infractionId, targetUser);
    } catch (err) {
      console.error(err);
      interaction.reply(`There was a problem removing the infraction.`);
    }
  },
};

async function validateInfractionId(userId, infractionId) {
  const sql = `SELECT user, id, valid FROM infractions WHERE id = ?;`;
  const values = [infractionId];
  try {
    const [infractions] = await promisePool.execute(sql, values);
    if (infractions[0] && infractions[0].user !== userId) {
      return {
        isValid: false,
        msg: 'The infraction does not belong to the targeted user.',
      };
    } else if (infractions[0]?.valid == 0) {
      return {isValid: false, msg: 'Please include a valid infraction ID'};
    } else if (infractions[0]?.valid == 1) {
      return {isValid: true};
    } else {
      return {isValid: false, msg: 'Please include a valid infraction ID.'};
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

async function deactivateInfractionDB(interaction, infractionId, targetUser) {
  try {
    const invalidateSQL = `UPDATE infractions SET valid = ? WHERE id = ?;`;
    const invalidateValues = [false, infractionId];
    await promisePool.execute(invalidateSQL, invalidateValues);

    const modlogSQL = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
    (now(), ?, ?, NULL, NULL);`;
    const action = `removeinfraction ${infractionId} ${targetUser.id}`;
    const modlogValues = [interaction.user.id, action];
    await promisePool.execute(modlogSQL, modlogValues);
  } catch (err) {
    throw new Error(err.message);
  }
}

async function removeInfractionResponse(interaction, infractionId, targetUser) {
  await interaction.reply(
    `Infraction #${infractionId} was removed from ${targetUser.username}.`
  );
}