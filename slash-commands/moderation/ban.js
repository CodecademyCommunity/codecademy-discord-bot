const Discord = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {promisePool} = require('../../config/db');
const {sendToAuditLogsChannel} = require('../../helpers/sendToAuditLogs');
const {
  isServerStaff,
  sendNoTargetStaffReply,
} = require('../../helpers/validation');

const banIntro = "You've been banned for the following reason: ```";
const unbanRequest =
  ' ``` If you wish to challenge this ban, please submit a response in this Google Form: https://forms.gle/KxTMhPbi866r2FEz5';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user')
    .addUserOption((option) =>
      option.setName('target').setDescription('The user').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('The reason').setRequired(true).setMaxLength(255)
    )
    .addIntegerOption((option) =>
      option
        .setName('delete_msg_days')
        .setDescription(
          'Number of days of messages to delete (between 0 and 7)'
        )
        .setRequired(true)
        .addChoices(
          {name: '0 days', value: 0},
          {name: '1 day', value: 1},
          {name: '2 days', value: 2},
          {name: '3 days', value: 3},
          {name: '4 days', value: 4},
          {name: '5 days', value: 5},
          {name: '6 days', value: 6}
        )
    ),
  async execute(interaction) {
    const targetUser = await interaction.options.getUser('target');

    if (await isServerStaff(interaction, targetUser)) {
      return await sendNoTargetStaffReply(interaction);
    }

    const guildBans = await interaction.guild.bans.fetch();
    if (guildBans.has(targetUser.id)) {
      return await interaction.reply('The user is already banned');
    }

    const reason = interaction.options.getString('reason');

    const days = interaction.options.getInteger('delete_msg_days');

    const banText = banIntro + reason + unbanRequest;

    try {
      await dmUser(interaction, targetUser, banText);
      await interaction.guild.bans.create(targetUser, {days, reason});
      await interaction.channel.send(
        `${targetUser} was banned. Days of user messages deleted: ${days}`
      );
      await recordBanInDB(interaction, targetUser, reason);
      await sendToAuditLogsChannel(interaction, {
        color: '#0099ff',
        titleMsg: `${targetUser.tag} was banned by ${interaction.user.tag}:`,
        description: reason,
        targetUser: targetUser,
      });
      await interaction.reply(`Ban command was successful`);
    } catch (err) {
      console.error(err);
      return await interaction.reply(
        `There was an error while executing the command`
      );
    }
  },
};

async function dmUser(interaction, targetUser, banText) {
  try {
    await targetUser.send(banText);
    await interaction.channel.send(
      `Message regarding ban was sent to ${targetUser} successfully`
    );
  } catch (err) {
    if (err.code === Discord.Constants.APIErrors.CANNOT_MESSAGE_USER) {
      interaction.channel.send('The user cannot be messaged.');
    } else {
      throw new Error(err.message);
    }
  }
}

async function recordBanInDB(interaction, targetUser, reason) {
  const banSQL = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES
  (now(), ?, 'ban', NULL, ?, true, ?)`;
  const banValues = [targetUser.id, reason, interaction.user.id];

  const modlogSQL = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES (now(), ?, ?, NULL, ?)`;
  const modlogValues = [interaction.user.id, `Ban: ${targetUser.id}`, reason];

  try {
    await promisePool.execute(banSQL, banValues);
    await promisePool.execute(modlogSQL, modlogValues);
  } catch (err) {
    await interaction.channel.send('There was an error when writing to the DB');
    console.error(err);
  }
}
