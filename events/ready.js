const {commandRoles} = require('../config/slashCommandPermissions');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    try {
      const commands = await client.guilds.cache
        .get(process.env.GUILD_ID)
        ?.commands.fetch();

      for (const [cmdId, command] of commands) {
        if (commandRoles.has(command.name)) {
          await command.permissions.set({
            permissions: commandRoles.get(command.name).map((roleId) => ({
              id: roleId,
              type: 'ROLE',
              permission: true,
            })),
          });
          console.log('Permissions set for:', command.name, cmdId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  },
};
