const Discord = require('discord.js');

/**
 * Sends a message to the audit-logs channel
 * @param {any} interaction = Discord.js interaction
 * @param {Object} configObj Embed config object
 * @param {string} configObj.color Color of the embed
 * @param {string} configObj.titleMsg Title msg for embed
 * @param {string} [configObj.description] Description for embed
 */

async function sendToAuditLogsChannel(
  interaction,
  {color, titleMsg, description = ''}
) {
  const channel = await interaction.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const clearMsgEmbed = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(titleMsg)
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`
    )
    .setDescription(description)
    .setTimestamp()
    .setFooter({text: `${interaction.guild.name}`});

  await channel.send({embeds: [clearMsgEmbed]});
}

module.exports = {sendToAuditLogsChannel};
