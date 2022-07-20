const {SlashCommandBuilder} = require('@discordjs/builders');
const {sendToAuditLogsChannel} = require('../../helpers/sendToAuditLogs');
const {promisePool} = require('../../config/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removetimeout')
    .setDescription('Remove timeout from a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to remove timeout from')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('The reason for removing the timeout')
        .setMaxLength(255)
    ),

  async execute(interaction) {
    const toRemoveTimeout = await interaction.guild.members.fetch(
      await interaction.options.getUser('user')
    );
    const reason = await interaction.options.getString('reason');

    if (canRemoveTimeout(interaction, toRemoveTimeout)) {
      try {
        await removeTimeout(interaction, toRemoveTimeout, reason);
      } catch (e) {
        console.error(e);
        return interaction.reply(
          'Something went wrong while trying to remove the timeout.'
        );
      }
      await auditLogRemoveTimeout(interaction, toRemoveTimeout, reason);
      await recordRemoveTimeoutInDB(interaction, toRemoveTimeout, reason);
    }
  },
};

function canRemoveTimeout(interaction, toRemoveTimeout) {
  if (
    toRemoveTimeout.communicationDisabledUntilTimestamp === null ||
    toRemoveTimeout.communicationDisabledUntil < Date.now()
  ) {
    interaction.reply('This user is not timed out.');
    return false;
  }
  return true;
}

async function removeTimeout(interaction, toRemoveTimeout) {
  toRemoveTimeout.timeout(null);
  await interaction.reply(`Removed timeout from ${toRemoveTimeout}.`);
}

async function auditLogRemoveTimeout(interaction, toRemoveTimeout, reason) {
  await sendToAuditLogsChannel(interaction, {
    color: '#0099ff',
    titleMsg: `Removed timeout from ${toRemoveTimeout.user.tag}.`,
    description: `Reason: ${reason ? reason : 'No reason provided.'}`,
    targetUser: toRemoveTimeout.user,
  });
}

async function recordRemoveTimeoutInDB(interaction, toRemoveTimeout, reason) {
  const modLogSQL = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES (now(), ?, ?, NULL, ?);`;

  const modLogValues = [
    interaction.member.user.id,
    `removed timeout from user ${toRemoveTimeout.user.id}`,
    `${reason ? reason : 'No reason provided.'}`,
  ];

  try {
    await promisePool.execute(modLogSQL, modLogValues);
    console.log('1 record inserted into mod_log.');
  } catch (e) {
    interaction.channel.send({
      content: `Writing to the mod_log table failed!`,
    });
    console.error(e);
  }
}
