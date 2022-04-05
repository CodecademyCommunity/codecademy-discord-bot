const Discord = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {promisePool} = require('../../config/db');
const {getEmbedHexFlairColor} = require('../../helpers/design');
const {
  isServerStaff,
  sendNoTargetStaffReply,
} = require('../../helpers/validation');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addnote')
    .setDefaultPermission(false)
    .setDescription('Write a user note and store in the db')
    .addUserOption((option) =>
      option.setName('target').setDescription('The user').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('note').setDescription('The note').setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = await interaction.options.getUser('target');

    if (await isServerStaff(interaction, targetUser)) {
      return await sendNoTargetStaffReply(interaction);
    }

    const note = await interaction.options.getString('note');

    if (note.length > 255) {
      return await interaction.reply(
        `Too long! Notes can only be 255 characters or less.`
      );
    }

    try {
      await addNoteToDB(interaction, targetUser, note);
      await displayNoteEmbed(interaction, targetUser, note);
    } catch (err) {
      console.error(err);
      interaction.reply(`There was a problem adding the note.`);
    }
  },
};

async function displayNoteEmbed(interaction, targetUser, note) {
  const embed = new Discord.MessageEmbed()
    .setAuthor({
      name: `${targetUser.username}#${targetUser.discriminator}`,
      iconURL: `https://cdn.discordapp.com/avatars/${targetUser.id}/${targetUser.avatar}.png`,
    })
    .setTitle(`New note`)
    .setColor(getEmbedHexFlairColor())
    .addField(`Note:`, `${note}`)
    .setTimestamp()
    .setFooter({text: `${interaction.guild.name}`});

  await interaction.reply({embeds: [embed]});
}

async function addNoteToDB(interaction, targetUser, note) {
  const sql = `INSERT INTO user_notes (timestamp, user, moderator, note)
      VALUES (now(), ?, ?, ?);`;
  const values = [targetUser.id, interaction.user.id, note];
  try {
    await promisePool.execute(sql, values);
  } catch (err) {
    throw new Error(err.message);
  }
}