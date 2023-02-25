const Discord = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {promisePool} = require('../../config/db');
const {sendToAuditLogsChannel} = require('../../helpers/sendToAuditLogs');
const {
  isServerStaff,
  sendNoTargetStaffReply,
} = require('../../helpers/validation');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('warns a user of an infraction and logs infraction in db')
    .addUserOption((option) =>
      option.setName('target').setDescription('The user').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('The reason')
        .setRequired(true)
        .setMaxLength(255)
    ),
  async execute(interaction) {
    const targetUser = await interaction.options.getUser('target');
    const reason = await interaction.options.getString('reason');

    if (await isServerStaff(interaction, targetUser)) {
      return await sendNoTargetStaffReply(interaction);
    }

    try {
      await dmTheUser(interaction, targetUser, reason);
      await recordWarnInDB(interaction, targetUser, reason);
      await sendToAuditLogsChannel(interaction, {
        color: 0xf1d302,
        titleMsg: `${targetUser.tag} was warned by ${interaction.user.tag}:`,
        description: reason,
        targetUser,
      });
      return await interaction.reply({
        content: `${interaction.user} just warned ${targetUser}`,
      });
    } catch (err) {
      console.error(err);
      if (err.code === Discord.Constants.APIErrors.CANNOT_MESSAGE_USER) {
        return await interaction.reply('The user cannot be messaged.');
      }
      return await interaction.reply(
        `There was a problem with the warn command.`
      );
    }
  },
};

async function dmTheUser(interaction, targetUser, reason) {
  const dmEmbed = new Discord.EmbedBuilder()
    .setColor(0xf1d302)
    .setTitle(`Warning to ${targetUser.username}`)
    .setDescription(reason)
    .setTimestamp()
    .setFooter({text: interaction.guild.name});
  return await targetUser.send({embeds: [dmEmbed]});
}

async function recordWarnInDB(interaction, targetUser, warnReason) {
  try {
    const warnSql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator)
    VALUES (now(), ?, 'warn', NULL, ?, true, ?)`;
    const verbalValues = [targetUser.id, warnReason, interaction.user.id];
    await promisePool.execute(warnSql, verbalValues);

    const modlogSQL = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason)
    VALUES (now(), ?, ?, NULL, ?)`;
    const modlogValues = [
      interaction.user.id,
      `Warn of user: ${targetUser.id}`,
      warnReason,
    ];
    return await promisePool.execute(modlogSQL, modlogValues);
  } catch (err) {
    throw new Error(err.message);
  }
}
