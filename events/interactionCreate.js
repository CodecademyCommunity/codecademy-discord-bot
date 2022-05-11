const {commandRoles} = require('../config/slashCommandPermissions');

function isAuthorized(interaction, commandRoles) {
  const allowedRoles = commandRoles.get(interaction.commandName);
  if (
    allowedRoles[0] === '@everyone' ||
    interaction.member.roles.cache.some((r) => allowedRoles.includes(r.id))
  ) {
    return true;
  }
  return false;
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    if (!isAuthorized(interaction, commandRoles)) {
      return await interaction.reply({
        content: `You don't have permissions for this command`,
        ephemeral: true,
      });
    }

    const command = interaction.client.slashCommands.get(
      interaction.commandName
    );

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  },
};
