const {EmbedBuilder} = require('discord.js');
const {getEmbedHexFlairColor} = require('../helpers/design');

async function displayRecordsLog({interaction, targetUser, recordCollections}) {
  const payload = {
    content: ':ledger: **Results** :ledger:',
    embeds: [],
  };

  for (const collection of recordCollections) {
    const totalRecords = collection.records.length;

    if (!totalRecords) {
      payload.content += `\n${targetUser.tag} doesn't have any ${collection.name}`;
    } else {
      const recordsEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${targetUser.tag}'s ${collection.name}`,
          iconURL: `https://cdn.discordapp.com/avatars/${targetUser.id}/${targetUser.avatar}.png`,
        })
        .setColor(getEmbedHexFlairColor())
        .setDescription(`Total: ${totalRecords}`)
        .addFields(...collection.records)
        .setTimestamp()
        .setFooter({text: interaction.guild.name});

      payload.embeds.push(recordsEmbed);
    }
  }
  return await interaction.reply(payload);
}

module.exports = {displayRecordsLog};
