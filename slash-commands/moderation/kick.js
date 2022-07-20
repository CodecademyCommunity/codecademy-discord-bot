const Discord = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {promisePool} = require('../../config/db');
const {sendToAuditLogsChannel} = require('../../helpers/sendToAuditLogs');
const {
  isServerStaff,
  sendNoTargetStaffReply,
} = require('../../helpers/validation');

const kickIntro =
  "You've been kicked from the Codecademy Community server for the following reason: ```";
const kickOutro = ' ```';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user')
    .addUserOption((option) =>
      option.setName('target').setDescription('The user').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('The reason').setRequired(true).setMaxLength(255)
    ),
  async execute(interaction) {
    const targetUser = await interaction.guild.members.cache.get(
      await interaction.options.getUser('target')?.id
    );
    if (!targetUser) {
      return interaction.reply('The specified user could not be found.');
    }

    if (await isServerStaff(interaction, targetUser)) {
      return await sendNoTargetStaffReply(interaction);
    }

    const reason = await interaction.options.getString('reason');

    const kickText = kickIntro + reason + kickOutro;

    try {
      await dmUser(interaction, targetUser, kickText);
      await targetUser.kick(kickText);
      await interaction.channel.send(`${targetUser} was kicked`);
      await recordKickInDB(interaction, targetUser, reason);
      await sendToAuditLogsChannel(interaction, {
        color: '#0099ff',
        titleMsg: `${targetUser.user.tag} was kicked by ${interaction.user.tag}:`,
        description: reason,
        targetUser: targetUser.user,
      });
      await interaction.reply(`Kick command was successful`);
    } catch (err) {
      console.error(err);
      return await interaction.reply(
        `There was an error while executing the command`
      );
    }
  },
};

async function dmUser(interaction, targetUser, kickText) {
  try {
    await targetUser.send(kickText);
    await interaction.channel.send(
      `Message regarding kick was sent to ${targetUser} successfully`
    );
  } catch (err) {
    if (err.code === Discord.Constants.APIErrors.CANNOT_MESSAGE_USER) {
      interaction.channel.send('The user cannot be messaged.');
    } else {
      throw new Error(err.message);
    }
  }
}

async function recordKickInDB(interaction, targetUser, reason) {
  const kickSQL = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES 
  (now(), ?, 'kick', NULL, ?, true, ?)`;
  const kickValues = [targetUser.id, reason, interaction.user.id];

  const modlogSQL = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES (now(), ?, ?, NULL, ?)`;
  const modlogValues = [interaction.user.id, `Kick: ${targetUser.id}`, reason];
  try {
    await promisePool.execute(kickSQL, kickValues);
    await promisePool.execute(modlogSQL, modlogValues);
  } catch (err) {
    await interaction.channel.send('There was an error when writing to the DB');
    console.error(err);
  }
}
