const Discord = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {promisePool} = require('../../config/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearmessages')
    .setDefaultPermission(false)
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
      await clearMessages(interaction, msgCount);
      await clearMessagesSQL(interaction.user.id, msgCount);
      await sendClearMessagesEmbed(interaction, msgCount);
      await interaction.reply({content: `${msgCount} messages were deleted.`});
    } catch (err) {
      console.error(err);
      await interaction.reply(`There was a problem clearing the messages.`);
    }
  },
};

function validateClearMessages(msgCount) {
  const data = {
    status: false,
    err: null,
  };
  if (msgCount < 1 || msgCount > 100) {
    data.err = 'The number of messages have to be between 1 and 100.';
    return data;
  }
  data.status = true;
  return data;
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

async function sendClearMessagesEmbed(interaction, msgCount) {
  // Sends Audit Log Embed
  const channel = await interaction.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const clearMsgEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${interaction.user.tag} deleted ${msgCount} messages in #${interaction.channel.name}`
    )
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`
    )
    .setTimestamp()
    .setFooter({text: `${interaction.guild.name}`});

  await channel.send({embeds: [clearMsgEmbed]});
}

async function clearMessages(interaction, msgCount) {
  try {
    await interaction.channel.bulkDelete(msgCount + 1);
  } catch (err) {
    throw new Error(err.message);
  }
}
