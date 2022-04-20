const Discord = require('discord.js');

/**
 * Sends a message to the audit-logs channel.
 * Include a target user object as the optional targetUser parameter in order
 * to generate a thumbnail of the target user.
 * @param {any} interaction Discord.js interaction
 * @param {Object} configObj Embed config object
 * @param {string} configObj.color Color of the embed
 * @param {string} configObj.titleMsg Title msg for embed
 * @param {string} [configObj.description] Description for embed
 * @param {Object} [configObj.targetUser] User object for the thumbnail
 */
async function sendToAuditLogsChannel(
  interaction,
  {color, titleMsg, description = '', targetUser = null}
) {
  const channel = await interaction.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );
  const clearMsgEmbed = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(titleMsg)
    .setThumbnail(
      targetUser
        ? `https://cdn.discordapp.com/avatars/${targetUser.id}/${targetUser.avatar}.png`
        : `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`
    )
    .setDescription(description)
    .setTimestamp()
    .setFooter({text: `${interaction.guild.name}`});

  await channel.send({embeds: [clearMsgEmbed]});
}

module.exports = {sendToAuditLogsChannel};
