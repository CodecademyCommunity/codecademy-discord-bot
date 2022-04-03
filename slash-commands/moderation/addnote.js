const Discord = require('discord.js');
const dateFormat = require('dateformat');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {getConnection} = require('../../config/db');
const {getEmbedHexFlairColor} = require('../../helpers/design');

const con = getConnection();

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
    // Make sure only SU, Mods and Admin can run the command
    const targetUser = await interaction.options.getUser('target');

    if (await notHighRoller(interaction, targetUser)) {
      const note = await interaction.options.getString('note');

      if (!note) return interaction.reply(`You forgot to write the note.`);
      if (note.length > 255) {
        return interaction.reply(
          `Too long! Notes can only be 255 characters or less.`
        );
      }

      // Feedback back to the command caller
      await postEmbed(interaction, targetUser, note);

      // write it to the db
      await addNoteToDB(interaction, con, targetUser, note);
    }
  },
};

async function postEmbed(interaction, targetUser, note) {
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

async function addNoteToDB(interaction, con, targetUser, note) {
  const now = new Date();
  const timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

  const sql = `INSERT INTO user_notes (timestamp, user, moderator, note)
      VALUES (?, ?, ?, ?);`;

  const values = [timestamp, targetUser.id, interaction.user.id, note];
  const escaped = con.format(sql, values);

  con.query(escaped, function (err, result) {
    if (err) {
      console.log(err);
      // Include a warning in case something goes wrong writing to the db
      interaction.reply(`Writing to the db failed!`);
    } else {
      console.log(`1 note added to table: user_notes`);
    }
  });
}

async function notHighRoller(interaction, targetUser) {
  const user = await interaction.guild.members.cache.get(targetUser.id);

  if (
    user.roles.cache.some(
      (role) =>
        role.name === 'Forums Super User' ||
        role.name === 'Code Counselor' ||
        role.name === 'Moderator' ||
        role.name === 'Admin' ||
        role.name === 'Super Admin'
    )
  ) {
    await interaction.reply(
      `You cannot write a note about a Code Counselor, Moderator or Admin.`
    );
    return false;
  } else {
    return true;
  }
}
