const Discord = require('discord.js');
const dateformat = require('dateformat');
const ms = require('ms');
const {verifyReasonLength} = require('../../helpers/stringHelpers');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {promisePool} = require('../../config/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDefaultPermission(false)
    .setDescription('Timeout a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to timeout')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('duration')
        .setDescription(
          'How long the user should be timed out as <number><s|m|h|d|w>'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('The reason for the timeout')
        .setRequired(true)
    ),

  async execute(interaction) {
    let toTimeout;
    interaction.guild.members
      .fetch(await interaction.options.getUser('user'))
      .then((result) => (toTimeout = result));
    const duration = await interaction.options.getString('duration');
    const reason = await interaction.options.getString('reason');

    if (canTimeout(interaction, toTimeout, duration, reason)) {
      try {
        await timeoutUser(interaction, toTimeout, duration, reason);
      } catch (e) {
        console.log(e);
        interaction.reply(
          'Something went wrong while trying to timeout the user.'
        );
      }
      await auditLogTimeout(interaction, toTimeout, duration, reason);
      await recordTimeoutInDB(interaction, toTimeout, duration, reason);
      try {
        await dmTheUser(interaction, toTimeout, duration, reason);
      } catch (e) {
        console.log(e);
        interaction.reply(`${e.name}: ${e.message}`);
      }
    }
  },
};

// Validates data.
function canTimeout(interaction, toTimeout, duration, reason) {
  if (toTimeout === interaction.member) {
    interaction.reply('You cannot timeout yourself.');
    return false;
  }
  if (
    toTimeout.roles.cache.some(
      (role) =>
        role.name === 'Moderator' ||
        role.name === 'Admin' ||
        role.name === 'Super Admin'
    )
  ) {
    interaction.reply('You cannot timeout a moderator or admin.');
    return false;
  }
  if (
    toTimeout.communicationDisabledUntilTimestamp !== null &&
    toTimeout.communicationDisabledUntil > Date.now()
  ) {
    interaction.reply('This user is already timed out.');
    return false;
  }

  // Check if duration is valid.
  if (!duration.match(/^\d+.?\d*[smhdw]$/)) {
    interaction.reply(
      'Please provide a valid duration. Format should be `<number><s|m|h|d|w>`.'
    );
    return false;
  }
  if (ms(duration) > ms('28d')) {
    interaction.reply('Please enter a duration less than 28 days.');
    return false;
  }

  // Check if reason is of a valid length.
  if (!verifyReasonLength(reason, interaction)) return false;

  return true;
}

// Puts a user in timeout.
async function timeoutUser(interaction, toTimeout, duration, reason) {
  const durationInMs = ms(duration);
  toTimeout.timeout(durationInMs, reason);

  await interaction.reply(`${toTimeout} has been timed out for ${duration}.`);
}

// Sends message to #audit-logs.
async function auditLogTimeout(interaction, toTimeout, duration, reason) {
  const auditLogEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(
      `${toTimeout.user.username}#${toTimeout.user.discriminator} was timed out by ${interaction.member.user.tag} for ${duration}.`
    )
    .addField('Reason', reason)
    .setTimestamp()
    .setFooter({text: `${interaction.guild.name}`})
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${toTimeout.user.id}/${toTimeout.user.avatar}.png`
    );

  await interaction.guild.channels.cache
    .find((channel) => channel.name === 'audit-logs')
    .send({embeds: [auditLogEmbed]});
}

// Records timeout in infractions and mod_log tables.
async function recordTimeoutInDB(interaction, toTimeout, duration, reason) {
  const now = new Date();
  const timestamp = dateformat(now, 'yyyy-mm-dd HH:MM:ss');

  const infractionsSQL = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES (?, ?, 'timeout', ?, ?, true, ?);`;
  const infractionsValues = [
    timestamp,
    toTimeout.user.id,
    duration,
    reason,
    interaction.member.user.id,
  ];

  const modLogSQL = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES (?, ?, ?, ?, ?);`;
  const modLogValues = [
    timestamp,
    interaction.member.user.id,
    `timed out user ${toTimeout.user.id}`,
    duration,
    reason,
  ];

  try {
    await promisePool.execute(infractionsSQL, infractionsValues);
    await promisePool.execute(modLogSQL, modLogValues);
    console.log(
      '1 record inserted into infractions, 1 record inserted into mod_log.'
    );
  } catch (err) {
    interaction.channel.send({
      content: `I timed out ${toTimeout} but writing to the db failed!`,
    });
    throw new Error(err.message);
  }
}

// Attempts to DM the user with the reason for the timeout.
async function dmTheUser(interaction, toTimeout, duration, reason) {
  const verbalEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`You have been timed out for ${ms(ms(duration), {long: true})}.`)
    .addField('Reason', reason)
    .setTimestamp()
    .setFooter({text: `${interaction.guild.name}`})
    .setThumbnail(interaction.guild.iconURL({dynamic: true}));

  await toTimeout.user.send({embeds: [verbalEmbed]});
}
