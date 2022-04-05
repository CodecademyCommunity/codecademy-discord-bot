const {
  getDiscordJsFullPermissions,
} = require('../config/slashCommandPermissions');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(
      `Ready! Logged in as ${client.user.tag}. Updating permissions.`
    );

    try {
      const commands = await client.guilds.cache
        .get(process.env.GUILD_ID)
        ?.commands.fetch();

      const fullPermissions = getDiscordJsFullPermissions(commands);

      // Set role permissions by bulk method.
      // Docs: https://discordjs.guide/interactions/slash-commands.html#bulk-update-permissions

      await client.guilds.cache
        .get(process.env.GUILD_ID)
        ?.commands.permissions.set({fullPermissions});
      console.log('Permissions for slash-commands updated.');
    } catch (err) {
      console.error(err);
    }
  },
};