const {EmbedBuilder} = require('discord.js');
const ms = require('ms');
const {sendToAuditLogsChannel} = require('../../helpers/sendToAuditLogs');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {promisePool} = require('../../config/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to timeout')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('durationinteger')
        .setDescription(
          'Integer part of how long the user should be timed out for'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('durationunit')
        .setDescription(
          'Unit part of how long the user should be timed out for'
        )
        .setRequired(true)
        .addChoices(
          {name: 'seconds', value: 's'},
          {name: 'minutes', value: 'm'},
          {name: 'hours', value: 'h'},
          {name: 'days', value: 'd'},
          {name: 'weeks', value: 'w'}
        )
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('The reason for the timeout')
        .setRequired(true)
        .setMaxLength(255)
    ),

  async execute(interaction) {
    const toTimeout = await interaction.guild.members.fetch(
      await interaction.options.getUser('user')
    );
    const durationInteger = await interaction.options.getInteger(
      'durationinteger'
    );
    const durationUnit = await interaction.options.getString('durationunit');
    const reason = await interaction.options.getString('reason');

    const duration = durationInteger + durationUnit;

    if (canTimeout(interaction, toTimeout, duration, reason)) {
      try {
        await timeoutUser(interaction, toTimeout, duration, reason);
      } catch (e) {
        console.error(e);
        return interaction.reply(
          'Something went wrong while trying to timeout the user.'
        );
      }
      await auditLogTimeout(interaction, toTimeout, duration, reason);
      await recordTimeoutInDB(interaction, toTimeout, duration, reason);
      try {
        await dmTheUser(interaction, toTimeout, duration, reason);
      } catch (e) {
        interaction.channel.send(`${e.name}: ${e.message}`);
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
  if (ms(duration) <= 0) {
    interaction.reply('You must specify a duration greater than 0.');
    return false;
  }
  if (ms(duration) > ms('28d') - 1) {
    interaction.reply('Please enter a duration less than 28 days.');
    return false;
  }
  return true;
}

// Puts a user in timeout.
async function timeoutUser(interaction, toTimeout, duration, reason) {
  const durationInMs = ms(duration);
  toTimeout.timeout(durationInMs, reason);

  await interaction.reply(
    `${toTimeout} has been timed out for ${ms(ms(duration), {long: true})}.`
  );
}

// Sends message to #audit-logs.
async function auditLogTimeout(interaction, toTimeout, duration, reason) {
  await sendToAuditLogsChannel(interaction, {
    color: 0x0099ff,
    titleMsg: `${toTimeout.user.username}#${
      toTimeout.user.discriminator
    } was timed out by ${interaction.member.user.tag} for ${ms(ms(duration), {
      long: true,
    })}.`,
    description: `**Reason:** ${reason}`,
    targetUser: toTimeout.user,
  });
}

// Records timeout in infractions and mod_log tables.
async function recordTimeoutInDB(interaction, toTimeout, duration, reason) {
  const infractionsSQL = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, valid, moderator) VALUES (now(), ?, 'timeout', ?, ?, true, ?);`;
  const infractionsValues = [
    toTimeout.user.id,
    duration,
    reason,
    interaction.member.user.id,
  ];

  const modLogSQL = `INSERT INTO mod_log (timestamp, moderator, action, length_of_time, reason) VALUES (now(), ?, ?, ?, ?);`;
  const modLogValues = [
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
    console.error(err);
  }
}

// Attempts to DM the user with the reason for the timeout.
async function dmTheUser(interaction, toTimeout, duration, reason) {
  const verbalEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`You have been timed out for ${ms(ms(duration), {long: true})}.`)
    .addFields({name: 'Reason', value: reason})
    .setTimestamp()
    .setFooter({text: interaction.guild.name})
    .setThumbnail(interaction.guild.iconURL({dynamic: true}));

  await toTimeout.user.send({embeds: [verbalEmbed]});
}
