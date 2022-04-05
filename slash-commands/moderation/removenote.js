const Discord = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {promisePool} = require('../../config/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removenote')
    .setDefaultPermission(false)
    .setDescription('Removes a specific note based on the note ID provided')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('note-id').setDescription('The note id').setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = await interaction.options.getUser('user');
    const noteId = await interaction.options.getInteger('note-id');
    try {
      const {isValid, msg} = await validatenoteId(targetUser.id, noteId);
      if (!isValid) {
        return interaction.reply(msg);
      }
      await deactivateNoteDB(interaction, noteId, targetUser);
      await displayNoteEmbed(interaction, noteId, targetUser);
      await noteResponse(interaction, noteId, targetUser);
    } catch (err) {
      console.error(err);
      interaction.reply(`There was a problem removing the note.`);
    }
  },
};

async function validatenoteId(userId, noteId) {
  const sql = `SELECT user, valid FROM user_notes WHERE id = ?;`;
  const values = [noteId];
  try {
    const [notes] = await promisePool.execute(sql, values);
    if (notes[0] && notes[0].user !== userId) {
      return {
        isValid: false,
        msg: 'The note does not belong to the targeted user.',
      };
    } else if (notes[0]?.valid == 0) {
      return {isValid: false, msg: 'This note has already been removed.'};
    } else if (notes[0]?.valid == 1) {
      return {isValid: true};
    } else {
      return {isValid: false, msg: 'Please include a valid note ID.'};
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

async function deactivateNoteDB(interaction, noteId, targetUser) {
  try {
    const invalidateSQL = `UPDATE user_notes SET valid = ? WHERE id = ?;`;
    const invalidateValues = [false, noteId];
    await promisePool.execute(invalidateSQL, invalidateValues);

    const modlogSQL = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES
    (now(), ?, ?, NULL, NULL);`;
    const action = `removenote ${noteId} ${targetUser.id}`;
    const modlogValues = [interaction.user.id, action];
    await promisePool.execute(modlogSQL, modlogValues);
  } catch (err) {
    throw new Error(err.message);
  }
}

async function displayNoteEmbed(interaction, noteId, targetUser) {
  // Sends Audit Log Embed
  const channel = interaction.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  const userNoteEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${interaction.user.tag} removed an note from ${targetUser.username}#${targetUser.discriminator}`
    )
    .setDescription('Note #' + noteId)
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${targetUser.id}/${targetUser.avatar}.png`
    )
    .setTimestamp()
    .setFooter({text: `${interaction.guild.name}`});

  channel.send({embeds: [userNoteEmbed]});
}

async function noteResponse(interaction, noteId, targetUser) {
  await interaction.reply(
    `Note #${noteId} was removed from ${targetUser.username}.`
  );
}
