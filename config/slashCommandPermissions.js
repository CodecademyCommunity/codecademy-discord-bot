const {ID_CODE_COUNSELOR, ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN} = process.env;

module.exports = {
  // Commands with .setDefaultPermission(false) need to be enabled by adding role IDs to array.

  commandRoles: new Map([
    ['ping', [ID_CODE_COUNSELOR]],
    ['stats', [ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN]],
  ]),
};
