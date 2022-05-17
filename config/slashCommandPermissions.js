const {ID_CODE_COUNSELOR, ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN} = process.env;

// Commands with .setDefaultPermission(false) need to be enabled by adding role IDs to array.

const allStaffRoles = [
  ID_CODE_COUNSELOR,
  ID_MODERATOR,
  ID_ADMIN,
  ID_SUPER_ADMIN,
];
const moderatorRoles = [ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN];

const commandRoles = new Map([
  ['addnote', allStaffRoles],
  ['notes', allStaffRoles],
  ['ping', allStaffRoles],
  ['ban', moderatorRoles],
  ['clearmessages', moderatorRoles],
  ['kick', moderatorRoles],
  ['removenote', moderatorRoles],
  ['removetimeout', moderatorRoles],
  ['timeout', moderatorRoles],
  ['unban', moderatorRoles],
  ['verbal', moderatorRoles],
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
