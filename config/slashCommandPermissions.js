const {ID_CODE_COUNSELOR, ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN} = process.env;

// Commands with .setDefaultPermission(false) need to be enabled by adding role IDs to array.

const commandRoles = new Map([
  ['ping', [ID_CODE_COUNSELOR, ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN]],
  ['notes', [ID_CODE_COUNSELOR, ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN]],
  ['addnote', [ID_CODE_COUNSELOR, ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN]],
  ['removenote', [ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN]],
]);

/**
 * Returns an array used to set all application command permissions
 * @param {any} commands - Discord.js Collection of application commands
 * @return {Object[]} Discord.js array of objects to set permissions for all commands
 */
function getDiscordJsFullPermissions(commands) {
  return commands.map((command) => {
    return commandRoles.has(command.name)
      ? {
          id: command.id,
          permissions: commandRoles.get(command.name).map((roleId) => ({
            id: roleId,
            type: 'ROLE',
            permission: true,
          })),
        }
      : {
          id: command.id,
          permissions: [],
        };
  });
}

module.exports = {
  getDiscordJsFullPermissions,
};
