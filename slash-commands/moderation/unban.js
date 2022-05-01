const {SlashCommandBuilder} = require('@discordjs/builders');
const {promisePool} = require('../../config/db');
const {sendToAuditLogsChannel} = require('../../helpers/sendToAuditLogs');
const {
  isServerStaff,
  sendNoTargetStaffReply,
} = require('../../helpers/validation');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDefaultPermission(false)
    .setDescription('Unbans a user')
    .addUserOption((option) =>
      option.setName('target').setDescription('The user').setRequired(true)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');

    if (await isServerStaff(interaction, targetUser)) {
      return await sendNoTargetStaffReply(interaction);
    }

    const guildBans = await interaction.guild.bans.fetch();
    if (!guildBans.has(targetUser.id)) {
      return await interaction.reply('The user is not banned');
    }

    try {
      await interaction.guild.bans.remove(targetUser);
      await interaction.channel.send(`${targetUser} was unbanned`);
      await recordUnbanInDB(interaction, targetUser);
      await sendToAuditLogsChannel(interaction, {
        color: '#0099ff',
        titleMsg: `${targetUser.tag} was unbanned by ${interaction.user.tag}:`,
        targetUser: targetUser,
      });
      await interaction.reply(`Unban command was successful`);
    } catch (err) {
      console.error(err);
      return await interaction.reply(
        `There was an error while executing the command`
      );
    }
  },
};

async function recordUnbanInDB(interaction, targetUser) {
  const modlogSQL = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
  (now(), ?, ?, NULL, NULL)`;
  const modlogValues = [interaction.user.id, `Unban: ${targetUser.id}`];

  try {
    await promisePool.execute(modlogSQL, modlogValues);
  } catch (err) {
    await interaction.channel.send('There was an error when writing to the DB');
    console.error(err);
  }
}
