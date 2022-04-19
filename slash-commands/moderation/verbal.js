const Discord = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {promisePool} = require('../../config/db');
const {sendToAuditLogsChannel} = require('../../helpers/sendToAuditLogs');
const {
  isServerStaff,
  sendNoTargetStaffReply,
} = require('../../helpers/validation');
const {verifyReasonLength} = require('../../helpers/stringHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verbal')
    .setDefaultPermission(false)
    .setDescription('Sends a user a verbal warning and logs note in db')
    .addUserOption((option) =>
      option.setName('target').setDescription('The user').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('The reason').setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = await interaction.options.getUser('target');
    const reason = await interaction.options.getString('reason');

    if (await isServerStaff(interaction, targetUser)) {
      return await sendNoTargetStaffReply(interaction);
    }

    // Reason limited to 245 to stay below 255 with extra text added for user_notes
    if (!verifyReasonLength(reason, interaction, 245)) return false;

    try {
      await dmTheUser(interaction, targetUser, reason);
      await recordVerbalInDB(interaction, targetUser, reason);
      await sendToAuditLogsChannel(interaction, {
        color: '#f1d302',
        titleMsg: `${targetUser.tag} was verballed by ${interaction.user.tag}:`,
        description: reason,
      });
      return await interaction.reply({
        content: `${interaction.user} just verballed ${targetUser}`,
      });
    } catch (err) {
      if (err.code === Discord.Constants.APIErrors.CANNOT_MESSAGE_USER) {
        return await interaction.reply(
          'The user cannot be messaged. It is likely that DMs are turned off.'
        );
      }
      console.error(err);
      return await interaction.reply(`${err.name}: ${err.message}`);
    }
  },
};

async function dmTheUser(interaction, targetUser, reason) {
  const dmEmbed = new Discord.MessageEmbed()
    .setColor('#f1d302')
    .setTitle(`Verbal to ${targetUser.username}`)
    .addField(
      'This verbal is not an official warning.',
      '*However, please engage with the server constructively and review the rules if necessary.*'
    )
    .setDescription(reason)
    .setTimestamp()
    .setFooter({text: `${interaction.guild.name}`});
  return await targetUser.send({embeds: [dmEmbed]});
}

async function recordVerbalInDB(interaction, targetUser, verbalReason) {
  try {
    const verbalSql = `INSERT INTO user_notes (timestamp, user, moderator, note, valid)
    VALUES (now(), ?, ?, ?, true)`;
    const verbalValues = [
      targetUser.id,
      interaction.user.id,
      `Verbal: ${verbalReason}`,
    ];
    await promisePool.execute(verbalSql, verbalValues);

    const modlogSQL = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason)
    VALUES (now(), ?, ?, NULL, ?)`;
    const modlogValues = [
      interaction.user.id,
      `Verbal of user: ${targetUser.id}`,
      verbalReason,
    ];
    return await promisePool.execute(modlogSQL, modlogValues);
  } catch (err) {
    throw new Error(err.message);
  }
}
