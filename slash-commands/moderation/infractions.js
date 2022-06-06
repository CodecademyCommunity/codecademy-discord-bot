const Discord = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {formatDistanceToNow} = require('date-fns');
const {getEmbedHexFlairColor} = require('../../helpers/design');
const {promisePool} = require('../../config/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infractions')
    .setDescription(
      'Finds user infractions records in db and returns it to channel'
    )
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The user (mention or id)')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const targetUser = await interaction.options.getUser('target');
      const infractions = await getInfractionsFromDB(targetUser);
      await displayInfractionsLog(interaction, targetUser, infractions);
    } catch (err) {
      console.error(err);
      interaction.reply(`There was an error reading the infractions.`);
    }
  },
};

async function getInfractionsFromDB(targetUser) {
  try {
    const sqlInfractions = `SELECT timestamp,reason,id,action,valid FROM infractions WHERE user = ?`;
    const [infractions] = await promisePool.execute(sqlInfractions, [
      targetUser.id,
    ]);
    return infractions;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function displayInfractionsLog(interaction, targetUser, infractions) {
  const listOfinfractions = parseInfractions(interaction, infractions);
  const totalInfractions = listOfinfractions.length;

  if (totalInfractions) {
    const infractionsEmbed = new Discord.MessageEmbed()
      .setAuthor({
        name: `${targetUser.tag}'s infractions`,
        iconURL: `https://cdn.discordapp.com/avatars/${targetUser.id}/${targetUser.avatar}.png`,
      })
      .setColor(getEmbedHexFlairColor())
      .setDescription(`Total: ${totalInfractions}`)
      .addFields(...listOfinfractions)
      .setTimestamp()
      .setFooter({text: interaction.guild.name});

    return await interaction.reply({embeds: [infractionsEmbed]});
  } else {
    return await interaction.reply(
      `${targetUser.tag} doesn't have any infractions`
    );
  }
}

function parseInfractions(interaction, infractions) {
  return infractions.reduce((validInfractions, currentInfraction) => {
    if (currentInfraction.valid) {
      validInfractions.push({
        name: `ID: ${currentInfraction.id}  ${
          currentInfraction.action
        }  ${formatDistanceToNow(currentInfraction.timestamp)} ago`,
        value: currentInfraction.reason,
      });
    }
    return validInfractions;
  }, []);
}
