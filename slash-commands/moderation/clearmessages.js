const Discord = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {promisePool} = require('../../config/db');
const {sendToAuditLogsChannel} = require('../../helpers/sendToAuditLogs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearmessages')
    .setDescription('Clears a certain number of messages')
    .addIntegerOption((option) =>
      option
        .setName('count')
        .setDescription(`The number of messages to clear (1-100)`)
        .setRequired(true)
    ),
  async execute(interaction) {
    const msgCount = await interaction.options.getInteger('count');
    const {status, err} = validateClearMessages(msgCount);
    if (!status) {
      return await interaction.reply({content: err});
    }

    try {
      await interaction.channel.bulkDelete(msgCount);
      await clearMessagesSQL(interaction.user.id, msgCount);
      await sendToAuditLogsChannel(interaction, {
        color: '#0099ff',
        titleMsg: `${interaction.user.tag} deleted ${msgCount} messages in #${interaction.channel.name}`,
      });
      await interaction.reply({content: `${msgCount} messages were deleted.`});
    } catch (err) {
      if (
        err.code === Discord.Constants.APIErrors.BULK_DELETE_MESSAGE_TOO_OLD
      ) {
        return await interaction.reply(
          'You can only bulk delete messages that are under 14 days old.'
        );
      }
      console.error(err);
      return await interaction.reply(
        `There was a problem clearing the messages or recording in the db.`
      );
    }
  },
};

function validateClearMessages(msgCount) {
  const data = {
    status: false,
    err: null,
  };
  return msgCount < 1 || msgCount > 100
    ? {...data, err: 'The number of messages have to be between 1 and 100.'}
    : {...data, status: true};
}

async function clearMessagesSQL(userId, msgCount) {
  const action = 'clearmessages ' + msgCount;
  const sql = `
      INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
      (now(), ?, ?, NULL, NULL);`;

  const values = [userId, action];

  try {
    await promisePool.execute(sql, values);
  } catch (err) {
    throw new Error(err.message);
  }
}
